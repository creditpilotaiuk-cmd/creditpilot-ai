import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Line = { text: string; bold?: boolean; size?: number; colour?: "navy" | "blue" | "grey" };

function textValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function wrap(text: string, max = 92) {
  const words = text.replace(/[^\x20-\x7E]/g, "-").split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > max) { if (current) lines.push(current); current = word; } else current = `${current} ${word}`.trim();
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function GET(_request: Request, { params }: { params: Promise<{ customerId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { customerId } = await params;
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId }, include: { invoices: { include: { reminders: true, paymentPromises: true }, orderBy: { issueDate: "desc" } } } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  const invoiceIds = customer.invoices.map(invoice => invoice.id);
  const events = await prisma.auditEvent.findMany({ where: { companyId: user.companyId, OR: [{ entity: "Customer", entityId: customer.id }, { entity: "Invoice", entityId: { in: invoiceIds } }] }, include: { user: true }, orderBy: { createdAt: "asc" } });

  const statements = events.filter(event => event.action === "STATEMENT_SENT");
  const emails = events.filter(event => ["INVOICE_SENT", "REMINDER_SENT", "DELIVERY_CONFIRMED", "EMAIL_OPENED"].includes(event.action));
  const notes = events.filter(event => event.action === "NOTES_ADDED" || event.action === "PHONE_CALL_LOGGED");
  const documents = events.filter(event => ["DOCUMENT_UPLOADED", "DOCUMENT_ATTACHED"].includes(event.action));
  const reminders = customer.invoices.flatMap(invoice => invoice.reminders.map(reminder => ({ ...reminder, invoiceNumber: invoice.number })));
  const promises = customer.invoices.flatMap(invoice => invoice.paymentPromises.map(promise => ({ ...promise, invoiceNumber: invoice.number })));
  const outstandingInvoices = customer.invoices.filter(invoice => invoice.status !== "PAID" && invoice.status !== "WRITTEN_OFF");
  const statementLines: Line[] = outstandingInvoices.length ? [{ text: `Current statement balance: GBP ${outstandingInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0).toFixed(2)}`, bold: true }, ...outstandingInvoices.map(invoice => ({ text: `${invoice.number} | Due ${invoice.dueDate.toLocaleDateString("en-GB")} | ${invoice.status} | GBP ${Number(invoice.amount).toFixed(2)}` }))] : [{ text: "No outstanding statement balance.", colour: "grey" }];
  if (statements.length) statementLines.push(...statements.map(event => ({ text: `Statement sent ${event.createdAt.toLocaleString("en-GB")} by ${event.user?.name || event.user?.email || "System"}` })));
  const emailLines: Line[] = reminders.filter(reminder => reminder.status === "SENT").flatMap(reminder => [{ text: `${reminder.sentAt?.toLocaleString("en-GB") || reminder.createdAt.toLocaleString("en-GB")} | ${reminder.invoiceNumber} | ${reminder.subject}`, bold: true }, { text: reminder.body }]);
  emailLines.push(...emails.filter(event => event.action !== "REMINDER_SENT").map(event => ({ text: `${event.createdAt.toLocaleString("en-GB")} | ${event.action.replaceAll("_", " ")} | ${textValue((event.metadata as Record<string, unknown> | null)?.newValue)}` })));

  const sections: Array<{ title: string; lines: Line[] }> = [
    { title: "Invoices", lines: customer.invoices.length ? customer.invoices.flatMap(invoice => [{ text: `${invoice.number} | ${invoice.status} | GBP ${Number(invoice.amount).toFixed(2)} | Issued ${invoice.issueDate.toLocaleDateString("en-GB")} | Due ${invoice.dueDate.toLocaleDateString("en-GB")}`, bold: true }, { text: `Paid: ${invoice.paidAt ? invoice.paidAt.toLocaleDateString("en-GB") : "No"}`, colour: "grey" }]) : [{ text: "No invoices recorded.", colour: "grey" }] },
    { title: "Statements", lines: statementLines },
    { title: "Reminder history", lines: reminders.length ? reminders.map(reminder => ({ text: `${reminder.createdAt.toLocaleString("en-GB")} | ${reminder.invoiceNumber} | Stage ${reminder.stage} | ${reminder.status} | ${reminder.subject}` })) : [{ text: "No reminders recorded.", colour: "grey" }] },
    { title: "Emails", lines: emailLines.length ? emailLines : [{ text: "No email activity recorded.", colour: "grey" }] },
    { title: "Payment promises", lines: promises.length ? promises.map(promise => ({ text: `${promise.invoiceNumber} | ${promise.status} | GBP ${Number(promise.amount || 0).toFixed(2)} | Promised for ${promise.promisedFor.toLocaleDateString("en-GB")} | ${promise.notes || "No notes"}` })) : [{ text: "No payment promises recorded.", colour: "grey" }] },
    { title: "Timeline", lines: events.length ? events.map(event => ({ text: `${event.createdAt.toLocaleString("en-GB")} | ${event.action.replaceAll("_", " ")} | ${event.user?.name || event.user?.email || "System"}` })) : [{ text: "No timeline activity recorded.", colour: "grey" }] },
    { title: "Notes", lines: notes.length ? notes.map(event => ({ text: `${event.createdAt.toLocaleString("en-GB")} | ${textValue((event.metadata as Record<string, unknown> | null)?.newValue)}` })) : [{ text: "No notes recorded.", colour: "grey" }] },
    { title: "Documents", lines: documents.length ? documents.map(event => ({ text: `${event.createdAt.toLocaleString("en-GB")} | ${textValue((event.metadata as Record<string, unknown> | null)?.newValue)}` })) : [{ text: "No documents attached.", colour: "grey" }] },
  ];

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 790;
  const addPage = () => { page = pdf.addPage([595.28, 841.89]); y = 790; };
  const draw = (line: Line) => {
    const size = line.size || 10;
    const colour = line.colour === "blue" ? rgb(0.05, 0.35, 0.85) : line.colour === "grey" ? rgb(0.38, 0.43, 0.5) : rgb(0.05, 0.11, 0.22);
    for (const wrapped of wrap(line.text, size >= 16 ? 65 : 92)) { if (y < 55) addPage(); page.drawText(wrapped, { x: 48, y, size, font: line.bold ? bold : regular, color: colour }); y -= size + 5; }
  };
  draw({ text: "CREDITPILOT AI", bold: true, size: 11, colour: "blue" });
  draw({ text: "Collection Pack", bold: true, size: 24 });
  draw({ text: `${customer.name} | Generated ${new Date().toLocaleString("en-GB")} | Confidential`, colour: "grey" });
  draw({ text: `Company: ${user.company.name} | Customer email: ${customer.email || "Not recorded"}`, colour: "grey" });
  y -= 12;
  for (const section of sections) { if (y < 100) addPage(); draw({ text: section.title, bold: true, size: 16, colour: "blue" }); y -= 3; for (const line of section.lines) draw(line); y -= 12; }
  const pages = pdf.getPages();
  pages.forEach((item, index) => item.drawText(`CreditPilot AI | Confidential | Page ${index + 1} of ${pages.length}`, { x: 48, y: 25, size: 8, font: regular, color: rgb(0.45, 0.49, 0.55) }));
  const bytes = await pdf.save();
  const safeName = customer.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "customer";
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${safeName}-collection-pack.pdf"`, "Cache-Control": "private, no-store" } });
}

"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceLimitReached } from "@/lib/plan";

function text(formData: FormData, key: string) { const value = formData.get(key); return typeof value === "string" ? value.trim() : ""; }

export async function createInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customerId = text(formData, "customerId");
  const number = text(formData, "number");
  const amount = Number(text(formData, "amount"));
  const issueDate = new Date(text(formData, "issueDate"));
  const dueDate = new Date(text(formData, "dueDate"));
  if (!customerId || !number || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(dueDate.getTime())) redirect("/invoices?error=details");
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  if (!customer) redirect("/invoices?error=customer");
  if (await invoiceLimitReached(user.companyId)) redirect("/invoices?error=limit");
  await prisma.invoice.create({ data: { companyId: user.companyId, customerId, number, amount, issueDate: Number.isNaN(issueDate.getTime()) ? new Date() : issueDate, dueDate, status: dueDate < new Date() ? "OVERDUE" : "OUTSTANDING", source: "MANUAL" } });
  redirect("/invoices?created=1");
}

export async function importInvoicesCsv(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const upload = formData.get("file");
  if (!(upload instanceof File) || upload.size === 0) redirect("/invoices?error=file");
  const rows = (await upload.text()).split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) redirect("/invoices?error=file");
  const headers = rows[0].split(",").map((header) => header.trim().toLowerCase());
  const index = (name: string) => headers.indexOf(name);
  const required = ["invoice_number", "customer_name", "amount", "due_date"];
  if (required.some((name) => index(name) < 0)) redirect("/invoices?error=columns");
  const validRows = rows.slice(1).filter((row) => {
    const values = row.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    return Boolean(values[index("customer_name")] && values[index("invoice_number")] && Number.isFinite(Number(values[index("amount")])) && !Number.isNaN(new Date(values[index("due_date")]).getTime()));
  });
  if (await invoiceLimitReached(user.companyId, validRows.length)) redirect("/invoices?error=limit");
  let imported = 0;
  for (const row of rows.slice(1)) {
    const values = row.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    const customerName = values[index("customer_name")];
    const number = values[index("invoice_number")];
    const amount = Number(values[index("amount")]);
    const dueDate = new Date(values[index("due_date")]);
    if (!customerName || !number || !Number.isFinite(amount) || Number.isNaN(dueDate.getTime())) continue;
    const email = index("customer_email") >= 0 ? values[index("customer_email")] : "";
    const customer = email ? await prisma.customer.upsert({ where: { companyId_externalId: { companyId: user.companyId, externalId: email } }, update: { name: customerName }, create: { companyId: user.companyId, name: customerName, email, externalId: email } }) : await prisma.customer.create({ data: { companyId: user.companyId, name: customerName } });
    await prisma.invoice.create({ data: { companyId: user.companyId, customerId: customer.id, number, amount, issueDate: new Date(), dueDate, status: dueDate < new Date() ? "OVERDUE" : "OUTSTANDING", source: "CSV" } });
    imported += 1;
  }
  redirect(`/invoices?imported=${imported}`);
}

export async function sendInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const invoiceId = text(formData, "invoiceId");
  if (!user || !invoiceId) redirect("/invoices?error=send");
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: user.companyId }, include: { customer: true, company: true } });
  if (!invoice?.customer.email) redirect("/invoices?error=no-email");
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) redirect("/invoices?error=email-not-configured");
  const payment = invoice.company.paymentMethods === "BANK" || invoice.company.paymentMethods === "BOTH" ? `\n\nPayment by bank transfer:\nAccount name: ${invoice.company.bankAccountName || "Please contact us"}\nSort code: ${invoice.company.bankSortCode || "Please contact us"}\nAccount number: ${invoice.company.bankAccountNumber || "Please contact us"}\nReference: ${invoice.company.paymentReference || invoice.number}` : "";
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [invoice.customer.email], subject: `Invoice ${invoice.number} from ${invoice.company.name}`, text: `Hello ${invoice.customer.contactName || invoice.customer.name},\n\nPlease find your invoice details below.\n\nInvoice: ${invoice.number}\nAmount: £${Number(invoice.amount).toFixed(2)}\nDue date: ${invoice.dueDate.toLocaleDateString("en-GB")}${payment}\n\nPlease contact us if you have any questions.\n\nKind regards\n${invoice.company.name}` }) });
  redirect(`/invoices?sent=${response.ok ? "1" : "0"}`);
}

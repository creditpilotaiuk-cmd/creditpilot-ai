"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceLimitReached } from "@/lib/plan";

function text(formData: FormData, key: string) { const value = formData.get(key); return typeof value === "string" ? value.trim() : ""; }

export async function updateInvoiceStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const invoiceId = text(formData, "invoiceId");
  const status = text(formData, "status");
  const reason = text(formData, "reason");
  const allowed = ["OUTSTANDING", "OVERDUE", "DISPUTED", "ON_HOLD", "PAYMENT_PLAN", "WRITTEN_OFF", "LEGAL_ESCALATION", "PAID"];
  if (!user || !invoiceId || !allowed.includes(status)) redirect("/invoices?error=status");
  const ownerActionStatuses = ["ON_HOLD", "PAYMENT_PLAN", "LEGAL_ESCALATION", "WRITTEN_OFF"];
  if ((status === "DISPUTED" || ownerActionStatuses.includes(status)) && reason.length < 5) redirect("/invoices?error=action-reason");
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: user!.companyId } });
  if (!invoice) redirect("/invoices?error=status");
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: status as any } });
  const auditAction = status === "DISPUTED" ? "DISPUTE_RAISED" : status === "PAID" ? "PAYMENT_RECEIVED" : `INVOICE_STATUS_${status}`;
  await prisma.auditEvent.create({ data: { companyId: user!.companyId, userId: user!.id, action: auditAction, entity: "Invoice", entityId: invoiceId, metadata: { previousValue: invoice!.status, newValue: status, reason: reason || null, ipAddress: null } } });
  redirect("/invoices?updated=1");
}

export async function confirmInvoiceLegalProtection(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const invoiceId = text(formData, "invoiceId");
  const confirmations = ["invoiceCorrect", "goodsServicesSupplied", "recipientCorrect", "noDispute", "authorisedToContact"];
  if (!invoiceId || confirmations.some((key) => formData.get(key) !== "on")) redirect("/invoices?error=legal-confirmation");
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: user.companyId }, include: { customer: true } });
  if (!invoice?.customer.email) redirect("/invoices?error=legal-email");
  if (["DISPUTED", "ON_HOLD", "WRITTEN_OFF"].includes(invoice.status)) redirect("/invoices?error=legal-status");
  const previous = await prisma.auditEvent.findFirst({ where: { companyId: user.companyId, entity: "Invoice", entityId: invoice.id, action: "LEGAL_PROTECTION_CONFIRMED" }, orderBy: { createdAt: "desc" } });
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "LEGAL_PROTECTION_CONFIRMED", entity: "Invoice", entityId: invoice.id, customerId: invoice.customerId, metadata: { previousValue: previous ? "CONFIRMED" : null, newValue: { invoiceCorrect: true, goodsServicesSupplied: true, recipientCorrect: true, noDispute: true, authorisedToContact: true, recipient: invoice.customer.email }, ipAddress: null } } });
  redirect("/invoices?legalConfirmed=1");
}

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
  try {
    const invoice = await prisma.invoice.create({ data: { companyId: user.companyId, customerId, number, amount, issueDate: Number.isNaN(issueDate.getTime()) ? new Date() : issueDate, dueDate, status: dueDate < new Date() ? "OVERDUE" : "OUTSTANDING", source: "MANUAL" } });
    await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "INVOICE_UPLOADED", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: null, newValue: { number: invoice.number, source: "MANUAL" }, customerId, ipAddress: null } } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") redirect("/invoices?error=duplicate-number");
    throw error;
  }
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
    const invoice = await prisma.invoice.create({ data: { companyId: user.companyId, customerId: customer.id, number, amount, issueDate: new Date(), dueDate, status: dueDate < new Date() ? "OVERDUE" : "OUTSTANDING", source: "CSV" } });
    await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "INVOICE_UPLOADED", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: null, newValue: { number: invoice.number, source: "CSV" }, customerId: customer.id, ipAddress: null } } });
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
  if (response.ok) await prisma.$transaction([
    prisma.invoice.update({ where: { id: invoice.id }, data: { status: "SENT" } }),
    prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "INVOICE_SENT", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: invoice.status, newValue: { status: "SENT", recipient: invoice.customer.email }, customerId: invoice.customerId, ipAddress: null } } }),
  ]);
  redirect(`/invoices?sent=${response.ok ? "1" : "0"}`);
}

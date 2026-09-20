"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { brandedEmail, escapeEmailHtml } from "@/lib/email-brand";
import { formatWorkspaceCurrency, workspaceLocale } from "@/lib/currency";

export async function sendStatement(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  const customerId = formData.get("customerId");
  if (!user || typeof customerId !== "string") redirect("/statements");
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId }, include: { invoices: { where: { status: { not: "PAID" } }, orderBy: { dueDate: "asc" } } } });
  if (!customer?.email) redirect(`/statements/${customerId}?error=no-email`);
  const money = (amount: number) => formatWorkspaceCurrency(amount, user.company.defaultCurrency, user.company.country);
  const locale = workspaceLocale(user.company.country);
  const total = customer.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const rows = customer.invoices.map((invoice) => `<tr><td>${escapeEmailHtml(invoice.number)}</td><td>${invoice.dueDate.toLocaleDateString(locale)}</td><td>${escapeEmailHtml(invoice.status.toLowerCase())}</td><td>${money(Number(invoice.amount))}</td></tr>`).join("");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) redirect(`/statements/${customerId}?error=email-not-configured`);
  const content = `<p>Hello ${escapeEmailHtml(customer.contactName || customer.name)},</p><p>Please find your current statement of account below.</p><table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%"><tr><th>Invoice</th><th>Due date</th><th>Status</th><th>Amount</th></tr>${rows}</table><p><strong>Total outstanding: ${money(total)}</strong></p>`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [customer.email], subject: `Statement of account for ${customer.name}`, html: brandedEmail(content) }) });
  if (!response.ok) redirect(`/statements/${customerId}?error=send-failed`);
  await prisma.auditEvent.createMany({ data: customer.invoices.map((invoice) => ({ companyId: user.companyId, userId: user.id, action: "STATEMENT_SENT", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: null, newValue: { recipient: customer.email }, ipAddress: null } })) });
  redirect(`/statements/${customerId}?sent=1`);
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyInvoiceToken } from "@/lib/invoice-link";

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

export async function submitInvoiceQuestion(formData: FormData) {
  const token = value(formData, "token");
  const invoiceId = verifyInvoiceToken(token);
  if (!invoiceId) redirect("/");
  const message = value(formData, "message");
  const type = value(formData, "type") || "Question";
  if (message.length < 5) redirect(`/invoice/${token}?error=message`);
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId! }, include: { customer: true, company: { include: { users: true } } } });
  if (!invoice) redirect("/");
  const recipient = invoice.company.billingEmail || invoice.company.users[0]?.email;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!recipient || !key || !from) redirect(`/invoice/${token}?error=not-configured`);
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [recipient], subject: `${type} about invoice ${invoice.number}`, text: `A customer has submitted a ${type.toLowerCase()} about invoice ${invoice.number}.\n\nCustomer: ${invoice.customer.name}\nEmail: ${invoice.customer.email || "Not provided"}\nAmount: £${Number(invoice.amount).toFixed(2)}\n\nMessage:\n${message}` }) });
  redirect(`/invoice/${token}?sent=${response.ok ? "1" : "0"}`);
}

"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

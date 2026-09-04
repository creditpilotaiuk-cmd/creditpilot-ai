"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function markInvoicePaid(formData: FormData) { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); const invoiceId = formData.get("invoiceId"); if (!user || typeof invoiceId !== "string") redirect("/payments"); const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: user.companyId, status: { not: "PAID" } } }); if (!invoice) redirect("/payments"); await prisma.$transaction([prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID", paidAt: new Date() } }), prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "PAYMENT_RECEIVED", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: invoice.status, newValue: "PAID", ipAddress: null } } })]); redirect("/payments?paid=1"); }
export async function recordPaymentPromise(formData: FormData) { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); const invoiceId = formData.get("invoiceId"); const promisedFor = String(formData.get("promisedFor") || ""); if (!user || typeof invoiceId !== "string" || !promisedFor) redirect("/payments"); const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: user.companyId } }); if (!invoice) redirect("/payments"); await prisma.$transaction([prisma.paymentPromise.create({ data: { companyId: user.companyId, customerId: invoice.customerId, invoiceId: invoice.id, amount: invoice.amount, promisedFor: new Date(`${promisedFor}T12:00:00`) } }), prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "PAYMENT_PROMISE", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: null, newValue: promisedFor, ipAddress: null } } })]); redirect("/payments?promise=1"); }


export async function recordAccountPromise(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const customerId = String(formData.get("customerId") || "");
  const invoiceId = String(formData.get("invoiceId") || "");
  const promisedFor = String(formData.get("promisedFor") || "");
  const amount = Number(formData.get("amount"));
  const notes = String(formData.get("notes") || "").trim();
  if (!user || !customerId || !promisedFor || !Number.isFinite(amount) || amount <= 0) redirect("/payments?error=promise");

  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  const invoice = invoiceId ? await prisma.invoice.findFirst({ where: { id: invoiceId, customerId, companyId: user.companyId } }) : null;
  if (!customer || (invoiceId && !invoice)) redirect("/payments?error=promise");

  await prisma.$transaction([
    prisma.paymentPromise.create({
      data: {
        companyId: user.companyId,
        customerId,
        invoiceId: invoice?.id || null,
        amount,
        promisedFor: new Date(`${promisedFor}T12:00:00`),
        notes: notes || null,
      },
    }),
    prisma.auditEvent.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "PAYMENT_PROMISE",
        entity: "Customer",
        entityId: customerId,
        metadata: { invoiceId: invoice?.id || null, amount, promisedFor, notes: notes || null },
      },
    }),
  ]);
  redirect("/payments?promise=1");
}

export async function recordAccountPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const customerId = String(formData.get("customerId") || "");
  const invoiceId = String(formData.get("invoiceId") || "");
  const receivedOn = String(formData.get("receivedOn") || "");
  const amount = Number(formData.get("amount"));
  const reference = String(formData.get("reference") || "").trim();
  const settlesInvoice = formData.get("settlesInvoice") === "on";
  if (!user || !customerId || !receivedOn || !Number.isFinite(amount) || amount <= 0) redirect("/payments?error=payment");

  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  const invoice = invoiceId ? await prisma.invoice.findFirst({ where: { id: invoiceId, customerId, companyId: user.companyId } }) : null;
  if (!customer || (invoiceId && !invoice)) redirect("/payments?error=payment");

  const operations = [
    prisma.auditEvent.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "ACCOUNT_PAYMENT_RECORDED",
        entity: "Customer",
        entityId: customerId,
        metadata: { invoiceId: invoice?.id || null, invoiceNumber: invoice?.number || null, amount, receivedOn, reference: reference || null },
      },
    }),
  ];
  if (invoice && settlesInvoice) {
    operations.push(prisma.auditEvent.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "PAYMENT_RECEIVED",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: { previousValue: invoice.status, newValue: "PAID", amount, receivedOn },
      },
    }));
    await prisma.$transaction([
      prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID", paidAt: new Date(`${receivedOn}T12:00:00`) } }),
      ...operations,
    ]);
  } else {
    await prisma.$transaction(operations);
  }
  redirect("/payments?payment=1");
}

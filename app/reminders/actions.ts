"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function generateReminderDrafts() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const invoices = await prisma.invoice.findMany({ where: { companyId: user.companyId, status: { in: ["OVERDUE", "OUTSTANDING"] } }, include: { customer: true, reminders: true } });
  let created = 0;
  for (const invoice of invoices) {
    const daysOverdue = Math.floor((Date.now() - invoice.dueDate.getTime()) / 86400000);
    const daysUntilDue = Math.ceil((invoice.dueDate.getTime() - Date.now()) / 86400000);
    const maxStage = invoice.reminders.reduce((highest, reminder) => Math.max(highest, reminder.stage), 0);
    const nextStage = invoice.status === "OUTSTANDING" ? (daysUntilDue === 1 ? -1 : daysUntilDue === 7 ? -2 : 0) : maxStage + 1;
    const eligible = invoice.status === "OUTSTANDING"
      ? nextStage < 0
      : nextStage === 1 ? daysOverdue >= 7 : nextStage === 2 ? daysOverdue >= 8 : nextStage === 3 ? daysOverdue >= 15 : false;
    if (!eligible || (invoice.status === "OVERDUE" && nextStage > 3) || invoice.reminders.some((reminder) => reminder.status === "DRAFT" && reminder.stage === nextStage)) continue;
    const recipient = invoice.customer.contactName || invoice.customer.name;
    const amount = `£${Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
    const copy = nextStage === -2
      ? { subject: `Payment due in 7 days · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nA quick reminder that invoice ${invoice.number} for ${amount} is due in 7 days. If payment has already been arranged, please disregard this message. Otherwise, please let us know if you have any questions.\n\nKind regards` }
      : nextStage === -1
        ? { subject: `Payment due tomorrow · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} is due tomorrow. Please arrange payment by the due date, or contact us if anything needs checking.\n\nKind regards` }
        : nextStage === 1
      ? { subject: `Payment reminder · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} is now 7 days overdue. Please arrange payment when you can, or reply with the expected payment date. If there is an issue with the invoice, we’re happy to help.\n\nKind regards` }
      : nextStage === 2
        ? { subject: `Second payment reminder · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} remains unpaid and is now 8 days overdue. Please arrange payment within the next few days, or contact us today so we can resolve any query.\n\nKind regards` }
        : { subject: `Formal payment request · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} is now 15 days overdue. Please arrange payment promptly or contact us today to agree the next step. If payment has already been made, please send the remittance details so we can update our records.\n\nKind regards` };
    await prisma.reminder.create({ data: { companyId: user.companyId, customerId: invoice.customerId, invoiceId: invoice.id, stage: nextStage, subject: copy.subject, body: copy.body, status: "DRAFT" } });
    created += 1;
  }
  redirect(`/reminders?created=${created}`);
}

export async function approveReminder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const reminderId = formData.get("reminderId");
  if (typeof reminderId !== "string") redirect("/reminders");
  await prisma.reminder.updateMany({ where: { id: reminderId, companyId: user.companyId, status: "DRAFT" }, data: { status: "SCHEDULED", scheduledFor: new Date() } });
  redirect("/reminders?approved=1");
}

export async function sendReminder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const reminderId = formData.get("reminderId");
  if (typeof reminderId !== "string") redirect("/reminders");
  const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, companyId: user.companyId, status: "SCHEDULED" }, include: { customer: true } });
  if (!reminder) redirect("/reminders?error=not-found");
  if (!reminder.customer.email) redirect("/reminders?error=no-email");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) redirect("/reminders?error=email-not-configured");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [reminder.customer.email], subject: reminder.subject, text: reminder.body }) });
  if (!response.ok) { await prisma.reminder.update({ where: { id: reminder.id }, data: { status: "FAILED" } }); redirect("/reminders?error=send-failed"); }
  await prisma.reminder.update({ where: { id: reminder.id }, data: { status: "SENT", sentAt: new Date() } });
  redirect("/reminders?sent=1");
}

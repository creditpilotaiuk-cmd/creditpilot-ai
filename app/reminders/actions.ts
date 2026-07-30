"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function generateReminderDrafts() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const overdue = await prisma.invoice.findMany({ where: { companyId: user.companyId, status: "OVERDUE" }, include: { customer: true, reminders: true } });
  let created = 0;
  for (const invoice of overdue) {
    const daysOverdue = Math.floor((Date.now() - invoice.dueDate.getTime()) / 86400000);
    const maxStage = invoice.reminders.reduce((highest, reminder) => Math.max(highest, reminder.stage), 0);
    const nextStage = maxStage + 1;
    const eligible = nextStage === 1 ? daysOverdue >= 7 : nextStage === 2 ? daysOverdue >= 8 : nextStage === 3 ? daysOverdue >= 15 : false;
    if (!eligible || nextStage > 3 || invoice.reminders.some((reminder) => reminder.status === "DRAFT" && reminder.stage === nextStage)) continue;
    const recipient = invoice.customer.contactName || invoice.customer.name;
    const amount = `£${Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
    const copy = nextStage === 1
      ? { subject: `Friendly payment reminder: invoice ${invoice.number}`, body: `Hello ${recipient},\n\nThis is a friendly reminder that invoice ${invoice.number} for ${amount} is now 7 days overdue. Please let us know when payment is expected.\n\nKind regards` }
      : nextStage === 2
        ? { subject: `Second payment reminder: invoice ${invoice.number}`, body: `Hello ${recipient},\n\nOur records show that invoice ${invoice.number} for ${amount} remains unpaid. It is now 8 days overdue. Please arrange payment or contact us today if there is an issue.\n\nKind regards` }
        : { subject: `Final demand: invoice ${invoice.number}`, body: `Hello ${recipient},\n\nFINAL DEMAND: invoice ${invoice.number} for ${amount} is now 15 days overdue. Please make payment immediately or contact us today to discuss this balance. We reserve all rights regarding recovery of this debt.\n\nKind regards` };
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

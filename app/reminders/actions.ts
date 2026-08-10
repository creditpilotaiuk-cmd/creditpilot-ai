"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInvoiceToken } from "@/lib/invoice-link";
import { detectSmartReminderPattern } from "@/lib/smart-reminder-timing";

export async function generateReminderDrafts() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const dunningEvents = await prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Customer", action: "DUNNING_CONTROL_UPDATED" }, orderBy: { createdAt: "desc" } });
  const pausedCustomerIds = new Set<string>();
  const checkedCustomerIds = new Set<string>();
  for (const event of dunningEvents) {
    if (!event.entityId) continue;
    if (checkedCustomerIds.has(event.entityId)) continue;
    checkedCustomerIds.add(event.entityId);
    const metadata = (event.metadata || {}) as Record<string, unknown>;
    const newValue = (metadata.newValue || {}) as Record<string, unknown>;
    if (newValue.paused === true) pausedCustomerIds.add(event.entityId);
  }
  const invoices = await prisma.invoice.findMany({
    where: { companyId: user.companyId, status: { in: ["OVERDUE", "OUTSTANDING"] }, customerId: { notIn: [...pausedCustomerIds] } },
    include: {
      reminders: true,
      customer: { include: { invoices: { where: { status: "PAID", paidAt: { not: null } }, select: { paidAt: true }, orderBy: { paidAt: "desc" }, take: 12 } } },
    },
  });
  let created = 0;
  for (const invoice of invoices) {
    const daysOverdue = Math.floor((Date.now() - invoice.dueDate.getTime()) / 86400000);
    const daysUntilDue = Math.ceil((invoice.dueDate.getTime() - Date.now()) / 86400000);
    const smartPattern = detectSmartReminderPattern(invoice.customer.invoices.flatMap(({ paidAt }) => paidAt ? [paidAt] : []));
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const smartEligible = Boolean(smartPattern?.timing) && !invoice.reminders.some((reminder) => reminder.stage === smartPattern?.stage && reminder.createdAt >= todayStart);
    const maxStage = invoice.reminders.reduce((highest, reminder) => reminder.stage > 0 ? Math.max(highest, reminder.stage) : highest, 0);
    const standardStage = invoice.status === "OUTSTANDING" ? (daysUntilDue === 1 ? -1 : daysUntilDue === 7 ? -2 : 0) : maxStage + 1;
    const standardEligible = invoice.status === "OUTSTANDING"
      ? standardStage < 0
      : standardStage === 1 ? daysOverdue >= 1 : standardStage === 2 ? daysOverdue >= 8 : standardStage === 3 ? daysOverdue >= 15 : false;
    const nextStage = smartEligible ? smartPattern!.stage : standardStage;
    const eligible = smartEligible || standardEligible;
    if (!eligible || (!smartEligible && invoice.status === "OVERDUE" && nextStage > 3) || invoice.reminders.some((reminder) => reminder.status === "DRAFT" && reminder.stage === nextStage)) continue;
    const recipient = invoice.customer.contactName || invoice.customer.name;
    const amount = `£${Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
    const copy = smartEligible
      ? smartPattern!.timing === "DAY_BEFORE"
        ? { subject: `Payment timing reminder · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nBased on the usual payment timing for your account, this is a friendly reminder that invoice ${invoice.number} for ${amount} remains open. If payment is already arranged, no action is needed. Otherwise, please let us know if anything needs checking.\n\nKind regards` }
        : { subject: `Expected payment day · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} remains open. Your account normally records payment around today, so we wanted to send a timely reminder. If payment has already been made, please disregard this message.\n\nKind regards` }
      : nextStage === -2
      ? { subject: `Payment due in 7 days · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nA quick reminder that invoice ${invoice.number} for ${amount} is due in 7 days. If payment has already been arranged, please disregard this message. Otherwise, please let us know if you have any questions.\n\nKind regards` }
      : nextStage === -1
        ? { subject: `Payment due tomorrow · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} is due tomorrow. Please arrange payment by the due date, or contact us if anything needs checking.\n\nKind regards` }
        : nextStage === 1
      ? { subject: `Payment reminder · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} is now ${Math.max(1, daysOverdue)} day${daysOverdue === 1 ? "" : "s"} overdue. We appreciate that delays can occur; however, please arrange payment as soon as possible or confirm the expected payment date today. If there is an issue with the invoice, please let us know promptly so we can assist.\n\nKind regards` }
      : nextStage === 2
        ? { subject: `Second payment reminder · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nDespite our previous reminder, invoice ${invoice.number} for ${amount} remains unpaid and is now ${Math.max(8, daysOverdue)} days overdue. This matter is now urgent. Please arrange payment without further delay or contact us today with a confirmed payment date. If there is a query preventing payment, please notify us immediately so it can be resolved.\n\nKind regards` }
        : { subject: `Formal payment request · invoice ${invoice.number}`, body: `Hello ${recipient},\n\nInvoice ${invoice.number} for ${amount} is now 15 days overdue. Please arrange payment promptly or contact us today to agree the next step. If payment has already been made, please send the remittance details so we can update our records.\n\nKind regards` };
    let aiCopy = copy;
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey && !smartEligible) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${openAIKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.3, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You write concise, professional UK business credit-control emails. Return JSON with subject and body only. Never threaten legal action or invent payment details." }, { role: "user", content: `Write a ${nextStage === 3 ? "final demand" : nextStage === 2 ? "second reminder" : "friendly reminder"} for ${recipient}. Invoice ${invoice.number}, amount £${Number(invoice.amount).toFixed(2)}, ${Math.max(1, daysOverdue)} days overdue. Customer email history: ${invoice.reminders.length} previous reminder(s). For a first reminder, be patient and courteous but clearly time-sensitive. For a second reminder, be firmer and explicitly urgent while remaining polite. Ask for payment or a confirmed payment date today, and invite the customer to report any query promptly.` }] }) });
        if (response.ok) {
          const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
          const parsed = JSON.parse(result.choices?.[0]?.message?.content || "{}");
          if (typeof parsed.subject === "string" && typeof parsed.body === "string") aiCopy = { subject: parsed.subject, body: parsed.body };
        }
      } catch { /* Keep the reliable template if AI is unavailable. */ }
    }
    await prisma.$transaction([
      prisma.reminder.create({ data: { companyId: user.companyId, customerId: invoice.customerId, invoiceId: invoice.id, stage: nextStage, subject: aiCopy.subject, body: aiCopy.body, status: "DRAFT" } }),
      prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "REMINDER_GENERATED", entity: "Invoice", entityId: invoice.id, metadata: { previousValue: null, newValue: { subject: aiCopy.subject, body: aiCopy.body }, smartTiming: smartEligible ? { kind: smartPattern!.kind, timing: smartPattern!.timing, confidence: smartPattern!.confidence } : null, ipAddress: null } } }),
    ]);
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
  const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, companyId: user.companyId, status: "DRAFT" } });
  if (!reminder) redirect("/reminders?error=not-found");
  const dunningEvent = await prisma.auditEvent.findFirst({ where: { companyId: user.companyId, entity: "Customer", entityId: reminder.customerId, action: "DUNNING_CONTROL_UPDATED" }, orderBy: { createdAt: "desc" } });
  const dunningMetadata = (dunningEvent?.metadata || {}) as Record<string, unknown>;
  const dunningValue = (dunningMetadata.newValue || {}) as Record<string, unknown>;
  if (dunningValue.paused === true) redirect("/reminders?error=dunning-paused");
  await prisma.$transaction([
    prisma.reminder.update({ where: { id: reminder.id }, data: { status: "SCHEDULED", scheduledFor: new Date() } }),
    prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "REMINDER_APPROVED", entity: "Invoice", entityId: reminder.invoiceId, metadata: { previousValue: "DRAFT", newValue: "SCHEDULED", ipAddress: null } } }),
  ]);
  redirect("/reminders?approved=1");
}

export async function editReminder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const reminderId = formData.get("reminderId");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!user || typeof reminderId !== "string" || !subject || !body) redirect("/reminders?error=edit");
  const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, companyId: user.companyId, status: "DRAFT" } });
  if (!reminder) redirect("/reminders?error=not-found");
  await prisma.$transaction([
    prisma.reminder.update({ where: { id: reminder.id }, data: { subject, body } }),
    prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "REMINDER_EDITED", entity: "Invoice", entityId: reminder.invoiceId, metadata: { previousValue: { subject: reminder.subject, body: reminder.body }, newValue: { subject, body }, ipAddress: null } } }),
  ]);
  redirect("/reminders?edited=1");
}

export async function sendReminder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const reminderId = formData.get("reminderId");
  if (typeof reminderId !== "string") redirect("/reminders");
  const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, companyId: user.companyId, status: "SCHEDULED" }, include: { customer: true, company: true, invoice: true } });
  if (!reminder) redirect("/reminders?error=not-found");
  const dunningEvent = await prisma.auditEvent.findFirst({ where: { companyId: user.companyId, entity: "Customer", entityId: reminder.customerId, action: "DUNNING_CONTROL_UPDATED" }, orderBy: { createdAt: "desc" } });
  const dunningMetadata = (dunningEvent?.metadata || {}) as Record<string, unknown>;
  const dunningValue = (dunningMetadata.newValue || {}) as Record<string, unknown>;
  if (dunningValue.paused === true) redirect("/reminders?error=dunning-paused");
  if (["DISPUTED", "ON_HOLD", "PAYMENT_PLAN", "LEGAL_ESCALATION", "WRITTEN_OFF"].includes(reminder.invoice.status)) redirect("/reminders?error=invoice-on-hold");
  const legalConfirmation = await prisma.auditEvent.findFirst({ where: { companyId: user.companyId, entity: "Invoice", entityId: reminder.invoiceId, action: "LEGAL_PROTECTION_CONFIRMED" }, orderBy: { createdAt: "desc" } });
  const legalMetadata = (legalConfirmation?.metadata || {}) as Record<string, unknown>;
  const legalValue = (legalMetadata.newValue || {}) as Record<string, unknown>;
  if (!legalConfirmation || legalValue.recipient !== reminder.customer.email) redirect("/reminders?error=legal-confirmation-required");
  if (!reminder.customer.email) redirect("/reminders?error=no-email");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) redirect("/reminders?error=email-not-configured");
  const paymentDetails = reminder.company.paymentMethods === "BANK" || reminder.company.paymentMethods === "BOTH"
    ? `\n\nPayment by bank transfer:\nAccount name: ${reminder.company.bankAccountName || reminder.company.name}\nSort code: ${reminder.company.bankSortCode || "Please contact us for details"}\nAccount number: ${reminder.company.bankAccountNumber || "Please contact us for details"}\nReference: ${reminder.company.paymentReference || reminder.invoiceId}`
    : "";
  const stripeDetails = reminder.company.paymentMethods === "STRIPE" || reminder.company.paymentMethods === "BOTH" ? "\n\nYou can also pay securely online by card using the payment option provided by our accounts team." : "";
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://creditpilotai.co.uk";
  const invoiceUrl = `${baseUrl.replace(/\/$/, "")}/invoice/${createInvoiceToken(reminder.invoice.id)}`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [reminder.customer.email], subject: reminder.subject, text: `${reminder.body}${paymentDetails}${stripeDetails}\n\nView your invoice and payment options securely:\n${invoiceUrl}` }) });
  if (!response.ok) { await prisma.reminder.update({ where: { id: reminder.id }, data: { status: "FAILED" } }); redirect("/reminders?error=send-failed"); }
  await prisma.reminder.update({ where: { id: reminder.id }, data: { status: "SENT", sentAt: new Date() } });
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "REMINDER_SENT", entity: "Invoice", entityId: reminder.invoiceId, metadata: { previousValue: "SCHEDULED", newValue: { status: "SENT", recipient: reminder.customer.email, stage: reminder.stage }, customerId: reminder.customerId, ipAddress: null } } });
  if (reminder.stage === 3) {
    await prisma.aIRecommendation.create({ data: { companyId: user.companyId, customerId: reminder.customerId, invoiceId: reminder.invoiceId, title: `Escalation required: ${reminder.invoice.number}`, rationale: `The final demand has been sent and invoice ${reminder.invoice.number} remains unpaid. Automatic reminders have now ended.`, action: "Review and choose the next action", riskLevel: "HIGH" } });
  }
  redirect("/reminders?sent=1");
}

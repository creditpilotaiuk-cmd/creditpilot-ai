"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function sendCancellationEmails({ name, email, companyName, scheduledAtPeriodEnd }: { name: string | null; email: string; companyName: string; scheduledAtPeriodEnd: boolean }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.SUPPORT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  const supportEmail = process.env.SUPPORT_EMAIL || "support@creditpilotai.co.uk";
  if (!key || !from) return;

  const customerStatus = scheduledAtPeriodEnd
    ? "Your paid membership is scheduled to end at the close of your current paid billing period."
    : "We have received your request. Our team will review it and confirm the next steps. Your data will not be deleted immediately.";
  const messages = [
    {
      to: [supportEmail], reply_to: email, subject: "[CreditPilot cancellation] Request received",
      text: `A cancellation request has been submitted in CreditPilot AI.\n\nRequested by: ${name || "Customer"} <${email}>\nCompany: ${companyName}\nStripe cancellation scheduled at period end: ${scheduledAtPeriodEnd ? "Yes" : "No active paid subscription found"}`,
    },
    {
      to: [email], reply_to: supportEmail, subject: "We received your CreditPilot AI cancellation request",
      text: `Hi ${name || "there"},\n\nWe have received your cancellation request for ${companyName}. ${customerStatus}\n\nIf you need help, reply to this email or contact ${supportEmail}.\n\nCreditPilot AI Support`,
    },
  ];
  await Promise.allSettled(messages.map(message => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, ...message }),
  })));
}

export async function requestCancellation() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");

  const key = process.env.STRIPE_SECRET_KEY;
  let scheduled = false;
  if (key && user.company.stripeCustomerId) {
    const list = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(user.company.stripeCustomerId)}&status=all&limit=10`, { headers: { Authorization: `Bearer ${key}` } });
    if (list.ok) {
      const data = await list.json();
      const active = data.data?.find((subscription: { status: string; cancel_at_period_end: boolean }) => ["active", "trialing", "past_due"].includes(subscription.status) && !subscription.cancel_at_period_end);
      if (active) {
        const update = await fetch(`https://api.stripe.com/v1/subscriptions/${active.id}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "cancel_at_period_end=true" });
        scheduled = update.ok;
      }
    }
  }

  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "CANCELLATION_REQUESTED", entity: "Company", entityId: user.companyId, metadata: { requestedAt: new Date().toISOString(), scheduledAtPeriodEnd: scheduled } } });
  await sendCancellationEmails({ name: user.name, email: user.email, companyName: user.company.name, scheduledAtPeriodEnd: scheduled });
  redirect(`/pricing?cancelled=${scheduled ? "scheduled" : "requested"}`);
}

export async function changePlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const plan = String(formData.get("plan") || "");
  if (!user || !["Starter", "Growth", "Professional"].includes(plan)) redirect("/pricing?error=plan");
  await prisma.company.update({ where: { id: user!.companyId }, data: { plan } });
  redirect("/pricing?changed=1");
}

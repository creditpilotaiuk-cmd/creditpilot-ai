"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitSupportRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");

  const category = String(formData.get("category") || "Other").trim();
  const description = String(formData.get("description") || "").trim();
  if (description.length < 10) redirect("/support?error=description");

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = user.company.billingEmail || process.env.SUPPORT_EMAIL || user.email;
  if (!key || !from || !to) redirect("/support?error=email-not-configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: user.email,
      subject: `[CreditPilot support] ${category}`,
      text: `A customer has reported a problem in CreditPilot AI.\n\nCategory: ${category}\nReported by: ${user.name} <${user.email}>\nCompany: ${user.company.name}\n\nDescription:\n${description}`,
    }),
  });
  if (!response.ok) redirect("/support?error=send-failed");
  redirect("/support?sent=1");
}

"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { brandedEmail, escapeEmailHtml } from "@/lib/email-brand";

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const value = (formData: FormData, key: string) => { const v = formData.get(key); return typeof v === "string" ? v.trim() : ""; };

async function sendResetEmail(email: string, url: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return false;
  const html = brandedEmail(`<p>Use the button below to choose a new password.</p><p><a href="${escapeEmailHtml(url)}" style="display:inline-block;background:#2f66f6;color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">Reset password</a></p><p style="color:#64748b;font-size:13px">This secure link expires in 30 minutes and can only be used once.</p>`);
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [email], subject: "Reset your CreditPilot AI password", html, text: `Use this secure link to choose a new password:\n\n${url}\n\nThis link expires in 30 minutes and can only be used once.` }) });
  return response.ok;
}

export async function requestPasswordReset(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (user) {
    const raw = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hash(raw), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    const base = process.env.AUTH_URL || "http://localhost:3000";
    await sendResetEmail(user.email, `${base}/reset-password?token=${raw}`);
  }
  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = value(formData, "token");
  const password = value(formData, "password");
  if (!token || password.length < 8) redirect(`/reset-password?token=${encodeURIComponent(token)}&error=details`);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hash(token) } });
  if (!record || record.expiresAt < new Date()) redirect("/reset-password?error=expired");
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  await prisma.passwordResetToken.delete({ where: { id: record.id } });
  redirect("/login?reset=1");
}

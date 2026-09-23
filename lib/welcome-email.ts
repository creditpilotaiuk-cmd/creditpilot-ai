import { brandedEmail, escapeEmailHtml } from "@/lib/email-brand";

export async function sendWelcomeEmail({ name, email, companyName }: { name: string; email: string; companyName: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return false;

  const dashboardUrl = `${process.env.AUTH_URL || "https://www.creditpilotai.co.uk"}/dashboard`;
  const safeName = escapeEmailHtml(name || "there");
  const safeCompany = escapeEmailHtml(companyName);
  const html = brandedEmail(
    `<h1 style="margin:0 0 16px;font-size:25px;line-height:1.25;color:#071633">Welcome to CreditPilot AI</h1>
    <p>Hi ${safeName},</p>
    <p>Your CreditPilot AI workspace for <strong>${safeCompany}</strong> is ready.</p>
    <p>Start by adding your customers and importing invoice data. CreditPilot will then help you organise your daily collection work, track payment promises and keep each next step clear.</p>
    <p style="margin:24px 0"><a href="${escapeEmailHtml(dashboardUrl)}" style="display:inline-block;background:#2f66f6;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">Open your workspace</a></p>
    <p style="color:#64748b;font-size:13px">You are on Founding Beta access. No card is required and there is no automatic paid conversion.</p>`,
  );
  const text = `Hi ${name || "there"},\n\nYour CreditPilot AI workspace for ${companyName} is ready.\n\nOpen your workspace: ${dashboardUrl}\n\nYou are on Founding Beta access. No card is required and there is no automatic paid conversion.`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject: "Welcome to CreditPilot AI", html, text }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

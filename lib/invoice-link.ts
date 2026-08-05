import { createHmac, timingSafeEqual } from "node:crypto";

function signingSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "creditpilot-development-secret";
}

export function createInvoiceToken(invoiceId: string) {
  const payload = Buffer.from(invoiceId, "utf8").toString("base64url");
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyInvoiceToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { return Buffer.from(payload, "base64url").toString("utf8"); } catch { return null; }
}

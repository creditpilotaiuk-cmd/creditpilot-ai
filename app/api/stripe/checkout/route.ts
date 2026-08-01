import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripeKey } from "@/lib/stripe";

const priceIds: Record<string, string | undefined> = {
  Starter: process.env.STRIPE_STARTER_PRICE_ID,
  Growth: process.env.STRIPE_GROWTH_PRICE_ID,
  Professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { plan } = await request.json();
  const price = priceIds[plan];
  if (!price) return NextResponse.json({ error: "This plan is not configured yet." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const baseUrl = process.env.AUTH_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
  const body = new URLSearchParams({ mode: "subscription", "line_items[0][price]": price, "line_items[0][quantity]": "1", customer_email: session.user.email, "metadata[companyId]": user.companyId, "metadata[plan]": plan, "subscription_data[metadata][companyId]": user.companyId, "subscription_data[metadata][plan]": plan, success_url: `${baseUrl}/pricing?success=1`, cancel_url: `${baseUrl}/pricing?cancelled_checkout=1` });
  const result = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${stripeKey()}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  const checkout = await result.json();
  if (!result.ok) return NextResponse.json({ error: checkout.error?.message || "Stripe could not start checkout." }, { status: 400 });
  return NextResponse.json({ url: checkout.url });
}

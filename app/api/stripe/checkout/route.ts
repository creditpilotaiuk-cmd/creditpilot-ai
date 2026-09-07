import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripeKey } from "@/lib/stripe";

type CatalogueItem = {
  price: string | undefined;
  testPrice?: string;
  type: "plan" | "addon";
  requiredPlan?: "Growth" | "Professional";
};

const catalogue: Record<string, CatalogueItem> = {
  Starter: { price: process.env.STRIPE_STARTER_PRICE_ID, type: "plan" },
  Growth: { price: process.env.STRIPE_GROWTH_PRICE_ID, type: "plan" },
  Professional: { price: process.env.STRIPE_PROFESSIONAL_PRICE_ID, type: "plan" },
  "extra-250-invoices": { price: process.env.STRIPE_EXTRA_250_INVOICES_PRICE_ID || "price_1UD0EaLMDyY8z2tlX8rogbo8", testPrice: process.env.STRIPE_TEST_EXTRA_250_INVOICES_PRICE_ID || "price_1UD0nfLMDyY8z2tlCvZlQ9Fj", type: "addon" },
  "extra-1000-invoices": { price: process.env.STRIPE_EXTRA_1000_INVOICES_PRICE_ID || "price_1UD0FOLMDyY8z2tle3vKsmYU", testPrice: process.env.STRIPE_TEST_EXTRA_1000_INVOICES_PRICE_ID || "price_1UD0oLLMDyY8z2tl5jEbztTK", type: "addon" },
  "additional-growth-user": { price: process.env.STRIPE_ADDITIONAL_GROWTH_USER_PRICE_ID || "price_1UD0G8LMDyY8z2tl79Ow0vg4", testPrice: process.env.STRIPE_TEST_ADDITIONAL_GROWTH_USER_PRICE_ID || "price_1UD0p3LMDyY8z2tlNdrRHtgp", type: "addon", requiredPlan: "Growth" },
  "additional-professional-user": { price: process.env.STRIPE_ADDITIONAL_PROFESSIONAL_USER_PRICE_ID || "price_1UD0H4LMDyY8z2tlnREvyhvx", testPrice: process.env.STRIPE_TEST_ADDITIONAL_PROFESSIONAL_USER_PRICE_ID || "price_1UD0q0LMDyY8z2tliQ0w6gSZ", type: "addon", requiredPlan: "Professional" },
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { item } = await request.json();
  const selection = typeof item === "string" ? catalogue[item] : undefined;
  if (!selection) return NextResponse.json({ error: "This membership item is not configured yet." }, { status: 400 });
  const secretKey = stripeKey();
  const isTestMode = secretKey.startsWith("sk_test_");
  const price = isTestMode && selection.testPrice ? selection.testPrice : selection.price;
  if (!price) return NextResponse.json({ error: "This membership item is not configured yet." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (selection.requiredPlan && user.company.plan.toLowerCase() !== selection.requiredPlan.toLowerCase()) {
    return NextResponse.json({ error: `This add-on requires an active ${selection.requiredPlan} membership.` }, { status: 400 });
  }
  // A customer created in Stripe test mode cannot be used in live mode (and vice versa).
  // Validate the saved ID first, then let Checkout create the matching-mode customer when needed.
  let stripeCustomerId: string | undefined;
  if (user.company.stripeCustomerId) {
    const customerCheck = await fetch(`https://api.stripe.com/v1/customers/${user.company.stripeCustomerId}`, { headers: { Authorization: `Bearer ${secretKey}` } });
    if (customerCheck.ok) stripeCustomerId = user.company.stripeCustomerId;
  }
  const baseUrl = process.env.AUTH_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
  const metadata = selection.type === "plan" ? { plan: item } : { addon: item };
  const body = new URLSearchParams({ mode: "subscription", "line_items[0][price]": price, "line_items[0][quantity]": "1", ...(isTestMode ? { "managed_payments[enabled]": "false" } : {}), ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: session.user.email }), "metadata[companyId]": user.companyId, "metadata[type]": selection.type, ...Object.fromEntries(Object.entries(metadata).map(([key, value]) => [`metadata[${key}]`, value])), "subscription_data[metadata][companyId]": user.companyId, "subscription_data[metadata][type]": selection.type, ...Object.fromEntries(Object.entries(metadata).map(([key, value]) => [`subscription_data[metadata][${key}]`, value])), success_url: `${baseUrl}/pricing?success=1&type=${selection.type}`, cancel_url: `${baseUrl}/pricing?cancelled_checkout=1` });
  const result = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  const checkout = await result.json();
  if (!result.ok) return NextResponse.json({ error: checkout.error?.message || "Stripe could not start checkout." }, { status: 400 });
  return NextResponse.json({ url: checkout.url });
}

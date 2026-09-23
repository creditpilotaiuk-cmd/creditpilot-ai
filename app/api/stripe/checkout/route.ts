import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripeKey } from "@/lib/stripe";

type CatalogueItem = {
  price: string | undefined;
  testPrice?: string;
  type: "plan" | "addon";
  requiredPlan?: "Growth" | "Professional";
  irelandAmount: number;
  irelandLabel: string;
  usAmount: number;
  usLabel: string;
};

// Stripe's business-use SaaS tax code. Regional prices are created inline for
// approved EUR and USD amounts, so the classification must travel with them.
const BUSINESS_SAAS_TAX_CODE = "txcd_10103001";

const catalogue: Record<string, CatalogueItem> = {
  Starter: { price: process.env.STRIPE_STARTER_PRICE_ID, type: "plan", irelandAmount: 5900, irelandLabel: "CreditPilot AI Starter", usAmount: 6500, usLabel: "CreditPilot AI Starter" },
  Growth: { price: process.env.STRIPE_GROWTH_PRICE_ID, type: "plan", irelandAmount: 14900, irelandLabel: "CreditPilot AI Growth", usAmount: 16900, usLabel: "CreditPilot AI Growth" },
  Professional: { price: process.env.STRIPE_PROFESSIONAL_PRICE_ID, type: "plan", irelandAmount: 28900, irelandLabel: "CreditPilot AI Professional", usAmount: 32900, usLabel: "CreditPilot AI Professional" },
  "extra-250-invoices": { price: process.env.STRIPE_EXTRA_250_INVOICES_PRICE_ID || "price_1UD0EaLMDyY8z2tlX8rogbo8", testPrice: process.env.STRIPE_TEST_EXTRA_250_INVOICES_PRICE_ID || "price_1UD0nfLMDyY8z2tlCvZlQ9Fj", type: "addon", irelandAmount: 2900, irelandLabel: "CreditPilot AI — Extra 250 invoices", usAmount: 3500, usLabel: "CreditPilot AI — Extra 250 invoices" },
  "extra-1000-invoices": { price: process.env.STRIPE_EXTRA_1000_INVOICES_PRICE_ID || "price_1UD0FOLMDyY8z2tle3vKsmYU", testPrice: process.env.STRIPE_TEST_EXTRA_1000_INVOICES_PRICE_ID || "price_1UD0oLLMDyY8z2tl5jEbztTK", type: "addon", irelandAmount: 7500, irelandLabel: "CreditPilot AI — Extra 1,000 invoices", usAmount: 8500, usLabel: "CreditPilot AI — Extra 1,000 invoices" },
  "additional-growth-user": { price: process.env.STRIPE_ADDITIONAL_GROWTH_USER_PRICE_ID || "price_1UD0G8LMDyY8z2tl79Ow0vg4", testPrice: process.env.STRIPE_TEST_ADDITIONAL_GROWTH_USER_PRICE_ID || "price_1UD0p3LMDyY8z2tlNdrRHtgp", type: "addon", requiredPlan: "Growth", irelandAmount: 1400, irelandLabel: "CreditPilot AI — Additional Growth user", usAmount: 1600, usLabel: "CreditPilot AI — Additional Growth user" },
  "additional-professional-user": { price: process.env.STRIPE_ADDITIONAL_PROFESSIONAL_USER_PRICE_ID || "price_1UD0H4LMDyY8z2tlnREvyhvx", testPrice: process.env.STRIPE_TEST_ADDITIONAL_PROFESSIONAL_USER_PRICE_ID || "price_1UD0q0LMDyY8z2tliQ0w6gSZ", type: "addon", requiredPlan: "Professional", irelandAmount: 2100, irelandLabel: "CreditPilot AI — Additional Professional user", usAmount: 2400, usLabel: "CreditPilot AI — Additional Professional user" },
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { item, buyerType, immediateAccessConsent } = await request.json();
  const selection = typeof item === "string" ? catalogue[item] : undefined;
  if (!selection) return NextResponse.json({ error: "This membership item is not configured yet." }, { status: 400 });
  if (buyerType !== "business" && buyerType !== "consumer") return NextResponse.json({ error: "Please select whether you are buying for a business or for personal use." }, { status: 400 });
  if (buyerType === "consumer" && immediateAccessConsent !== true) return NextResponse.json({ error: "Immediate-access consent is required for a personal-use purchase." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (["IE", "US"].includes(user.company.country) && buyerType !== "business") return NextResponse.json({ error: `${user.company.country === "US" ? "US" : "Irish"} memberships are currently available to business customers only.` }, { status: 400 });
  if (selection.requiredPlan && user.company.plan.toLowerCase() !== selection.requiredPlan.toLowerCase()) {
    return NextResponse.json({ error: `This add-on requires an active ${selection.requiredPlan} membership.` }, { status: 400 });
  }
  const secretKey = stripeKey();
  const isTestMode = secretKey.startsWith("sk_test_");
  const regionalPricing = ["IE", "US"].includes(user.company.country);
  const billingCurrency = user.company.country === "IE" ? "EUR" : user.company.country === "US" ? "USD" : "GBP";
  const price = isTestMode && selection.testPrice ? selection.testPrice : selection.price;
  if (!regionalPricing && !price) return NextResponse.json({ error: "This membership item is not configured yet." }, { status: 400 });
  // A customer created in Stripe test mode cannot be used in live mode (and vice versa).
  // Validate the saved ID first, then let Checkout create the matching-mode customer when needed.
  let stripeCustomerId: string | undefined;
  if (user.company.stripeCustomerId) {
    const customerCheck = await fetch(`https://api.stripe.com/v1/customers/${user.company.stripeCustomerId}`, { headers: { Authorization: `Bearer ${secretKey}` } });
    if (customerCheck.ok) stripeCustomerId = user.company.stripeCustomerId;
  }
  const baseUrl = process.env.AUTH_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
  const consentRecordedAt = new Date().toISOString();
  const metadata = { ...(selection.type === "plan" ? { plan: item } : { addon: item }), billingCurrency, buyerType, immediateAccessConsent: buyerType === "consumer" ? "true" : "not-applicable", consentRecordedAt };
  const body = new URLSearchParams();
  const set = (key: string, value: string) => body.set(key, value);
  set("mode", "subscription");
  set("line_items[0][quantity]", "1");
  if (regionalPricing) {
    const amount = user.company.country === "IE" ? selection.irelandAmount : selection.usAmount;
    const label = user.company.country === "IE" ? selection.irelandLabel : selection.usLabel;
    set("line_items[0][price_data][currency]", billingCurrency.toLowerCase());
    set("line_items[0][price_data][product_data][name]", label);
    set("line_items[0][price_data][product_data][tax_code]", BUSINESS_SAAS_TAX_CODE);
    set("line_items[0][price_data][recurring][interval]", "month");
    set("line_items[0][price_data][unit_amount]", String(amount));
  } else {
    set("line_items[0][price]", price!);
  }
  if (isTestMode) set("managed_payments[enabled]", "false");
  set(stripeCustomerId ? "customer" : "customer_email", stripeCustomerId || session.user.email);
  set("metadata[companyId]", user.companyId);
  set("metadata[type]", selection.type);
  set("subscription_data[metadata][companyId]", user.companyId);
  set("subscription_data[metadata][type]", selection.type);
  for (const [key, value] of Object.entries(metadata)) {
    set(`metadata[${key}]`, value);
    set(`subscription_data[metadata][${key}]`, value);
  }
  set("success_url", `${baseUrl}/pricing?success=1&type=${selection.type}`);
  set("cancel_url", `${baseUrl}/pricing?cancelled_checkout=1`);
  const result = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  const checkout = await result.json();
  if (!result.ok) return NextResponse.json({ error: checkout.error?.message || "Stripe could not start checkout." }, { status: 400 });
  return NextResponse.json({ url: checkout.url });
}

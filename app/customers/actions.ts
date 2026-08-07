"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

export async function createCustomer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const name = value(formData, "name");
  const contactName = value(formData, "contactName");
  const email = value(formData, "email");
  const phone = value(formData, "phone");
  if (!name) redirect("/customers?error=name");

  await prisma.customer.create({ data: { companyId: user.companyId, name, contactName: contactName || null, email: email || null, phone: phone || null } });
  redirect("/customers?created=1");
}

export async function updateCreditLimit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customerId = value(formData, "customerId");
  const creditLimit = Number(value(formData, "creditLimit"));
  if (!customerId || !Number.isFinite(creditLimit) || creditLimit < 0) redirect("/customers?error=credit-limit");
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  if (!customer) redirect("/customers");
  const previous = await prisma.auditEvent.findFirst({ where: { companyId: user.companyId, entity: "Customer", entityId: customer.id, action: "CREDIT_LIMIT_SET" }, orderBy: { createdAt: "desc" } });
  const previousMetadata = (previous?.metadata || {}) as Record<string, unknown>;
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "CREDIT_LIMIT_SET", entity: "Customer", entityId: customer.id, metadata: { previousValue: previousMetadata.newValue ?? 0, newValue: creditLimit, ipAddress: null } } });
  redirect("/customers?creditLimit=1");
}

export async function refreshExternalRisk(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customerId = value(formData, "customerId");
  const domain = value(formData, "domain").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const duns = value(formData, "duns").replace(/\D/g, "");
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  if (!customer) redirect("/customers");

  let trustpilot: Record<string, unknown> | null = null;
  let dnb: Record<string, unknown> | null = null;
  const unavailable: string[] = [];
  const trustpilotKey = process.env.TRUSTPILOT_API_KEY;
  if (domain && trustpilotKey) {
    const response = await fetch(`https://api.trustpilot.com/v1/business-units/find?name=${encodeURIComponent(domain)}`, { headers: { apikey: trustpilotKey }, cache: "no-store" });
    if (response.ok) { const data = await response.json(); trustpilot = { domain, displayName: data.displayName ?? null, trustScore: data.score?.trustScore ?? null, stars: data.score?.stars ?? null, reviewCount: data.numberOfReviews?.total ?? null }; } else unavailable.push("Trustpilot profile not found");
  } else unavailable.push(!domain ? "Trustpilot domain required" : "Trustpilot API key not configured");

  const dnbToken = process.env.DNB_DIRECT_TOKEN;
  if (duns && dnbToken) {
    const response = await fetch(`https://direct.dnb.com/V5.0/organizations/${encodeURIComponent(duns)}/products/RTNG_TRND`, { headers: { Authorization: dnbToken }, cache: "no-store" });
    if (response.ok) { const data = await response.json(); const assessment = data?.OrderProductResponse?.OrderProductResponseDetail?.Product?.Organization?.Assessment; dnb = { duns, rating: assessment?.DNBStandardRating?.DNBStandardRating ?? null, financialCondition: assessment?.FinancialConditionText?.$ ?? assessment?.FinancialConditionText ?? null, history: assessment?.HistoryRatingText?.$ ?? assessment?.HistoryRatingText ?? null, trend: assessment?.OverallTrendText?.$ ?? assessment?.OverallTrendText ?? null }; } else unavailable.push("D&B rating unavailable");
  } else unavailable.push(!duns ? "D-U-N-S number required" : "D&B Direct token not configured");

  let score = customer.riskLevel === "LOW" ? 2 : customer.riskLevel === "MEDIUM" ? 1 : 0;
  const trustScore = Number(trustpilot?.trustScore ?? NaN);
  if (Number.isFinite(trustScore)) score += trustScore >= 4 ? 2 : trustScore >= 3 ? 1 : 0;
  const dnbRating = String(dnb?.rating || "");
  const dnbRiskClass = Number(dnbRating.match(/([1-4])$/)?.[1] || NaN);
  if (Number.isFinite(dnbRiskClass)) score += dnbRiskClass <= 2 ? 2 : dnbRiskClass === 3 ? 1 : 0;
  const sourceCount = 1 + (trustpilot ? 1 : 0) + (dnb ? 1 : 0);
  const reliability = sourceCount === 1 ? `${customer.riskLevel.charAt(0)}${customer.riskLevel.slice(1).toLowerCase()} risk · internal data only` : score >= sourceCount * 1.5 ? "Reliable" : score >= sourceCount ? "Review recommended" : "Higher risk";

  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "RISK_ASSESSMENT_UPDATED", entity: "Customer", entityId: customer.id, metadata: { previousValue: null, newValue: { reliability, internalRisk: customer.riskLevel, trustpilot, dnb, unavailable, domain: domain || null, duns: duns || null, checkedAt: new Date().toISOString() }, ipAddress: null } } });
  redirect("/customers?riskUpdated=1");
}

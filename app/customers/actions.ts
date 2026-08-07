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
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
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

export async function updateDunningControl(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customerId = value(formData, "customerId");
  const paused = value(formData, "paused") === "true";
  const reason = value(formData, "reason");
  if (!customerId || (paused && reason.length < 5)) redirect("/customers?error=dunning-reason");
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  if (!customer) redirect("/customers");
  const previous = await prisma.auditEvent.findFirst({ where: { companyId: user.companyId, entity: "Customer", entityId: customer.id, action: "DUNNING_CONTROL_UPDATED" }, orderBy: { createdAt: "desc" } });
  const previousMetadata = (previous?.metadata || {}) as Record<string, unknown>;
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "DUNNING_CONTROL_UPDATED", entity: "Customer", entityId: customer.id, metadata: { previousValue: previousMetadata.newValue ?? { paused: false }, newValue: { paused, reason: reason || null }, ipAddress: null } } });
  redirect(`/customers?dunning=${paused ? "paused" : "resumed"}`);
}

export async function refreshExternalRisk(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  if (!["GROWTH", "PROFESSIONAL"].includes(user.company.plan.toUpperCase())) redirect("/customers?error=premium-risk");
  const customerId = value(formData, "customerId");
  const domain = value(formData, "domain").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  if (!domain) redirect("/customers?error=domain");
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  if (!customer) redirect("/customers");

  let creditsafe: Record<string, unknown> | null = null;
  const unavailable: string[] = [];
  const creditsafeUsername = process.env.CREDITSAFE_USERNAME;
  const creditsafePassword = process.env.CREDITSAFE_PASSWORD;
  const creditsafeBaseUrl = (process.env.CREDITSAFE_API_URL || "https://connect.creditsafe.com/v1").replace(/\/$/, "");
  if (creditsafeUsername && creditsafePassword) {
    const authentication = await fetch(`${creditsafeBaseUrl}/authenticate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: creditsafeUsername, password: creditsafePassword }), cache: "no-store" });
    if (authentication.ok) {
      const authenticationData = await authentication.json();
      const token = authenticationData.token;
      const search = await fetch(`${creditsafeBaseUrl}/companies?countries=${encodeURIComponent(process.env.CREDITSAFE_COUNTRY || "GB")}&name=${encodeURIComponent(customer.name)}&pageSize=1`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (search.ok) {
        const searchData = await search.json();
        const match = searchData.companies?.[0] || searchData.data?.[0];
        const connectId = match?.id || match?.connectId;
        if (connectId) {
          const report = await fetch(`${creditsafeBaseUrl}/companies/${encodeURIComponent(connectId)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
          if (report.ok) { const data = await report.json(); const rating = data.report?.companySummary?.creditRating || data.companySummary?.creditRating || data.creditRating; creditsafe = { connectId, score: rating?.currentCreditRating?.commonValue ?? rating?.score ?? null, description: rating?.currentCreditRating?.commonDescription ?? rating?.description ?? null, creditLimit: rating?.currentCreditLimit?.value ?? data.creditLimit?.value ?? null, summary: rating?.currentCreditRating?.commonDescription ?? data.summary ?? null }; } else unavailable.push("Creditsafe report unavailable");
        } else unavailable.push("Creditsafe company match unavailable");
      } else unavailable.push("Creditsafe company search unavailable");
    } else unavailable.push("Creditsafe authentication unavailable");
  } else unavailable.push("Creditsafe service not configured");

  let score = customer.riskLevel === "LOW" ? 2 : customer.riskLevel === "MEDIUM" ? 1 : 0;
  const creditsafeScore = Number(creditsafe?.score ?? NaN);
  if (Number.isFinite(creditsafeScore)) score += creditsafeScore >= 70 ? 2 : creditsafeScore >= 40 ? 1 : 0;
  const sourceCount = 1 + (creditsafe ? 1 : 0);
  const reliability = sourceCount === 1 ? `${customer.riskLevel.charAt(0)}${customer.riskLevel.slice(1).toLowerCase()} risk · internal data only` : score >= sourceCount * 1.5 ? "Reliable" : score >= sourceCount ? "Review recommended" : "Higher risk";

  const summary = `Overall: ${reliability}. Creditsafe: ${creditsafe?.summary || creditsafe?.description || creditsafe?.score || "unavailable"}.`;
  const metadata = JSON.parse(JSON.stringify({ previousValue: null, newValue: { reliability, summary, internalRisk: customer.riskLevel, creditsafe, unavailable, domain, checkedAt: new Date().toISOString() }, ipAddress: null }));
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "RISK_ASSESSMENT_UPDATED", entity: "Customer", entityId: customer.id, metadata } });
  redirect("/customers?riskUpdated=1");
}

"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function saveCompanySettings(formData: FormData) { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); if (!user) redirect("/login"); const name = String(formData.get("name") || "").trim(); const billingEmail = String(formData.get("billingEmail") || "").trim(); const personalName = String(formData.get("personalName") || "").trim(); const paymentMethods = String(formData.get("paymentMethods") || "STRIPE"); const bankAccountName = String(formData.get("bankAccountName") || "").trim(); const bankSortCode = String(formData.get("bankSortCode") || "").trim(); const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim(); const paymentReference = String(formData.get("paymentReference") || "").trim(); if (!name || !personalName) redirect("/settings?error=name"); await prisma.company.update({ where: { id: user.companyId }, data: { name, billingEmail: billingEmail || null, paymentMethods, bankAccountName: bankAccountName || null, bankSortCode: bankSortCode || null, bankAccountNumber: bankAccountNumber || null, paymentReference: paymentReference || null } }); await prisma.user.update({ where: { id: user.id }, data: { name: personalName } }); redirect("/settings?saved=1"); }

export async function requestAccountDeletion() { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); if (!user) redirect("/login"); await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "ACCOUNT_DELETION_REQUESTED", entity: "Company", entityId: user.companyId } }); redirect("/settings?deletionRequested=1"); }

const permittedRights = new Set(["ACCESS", "RECTIFICATION", "RESTRICTION", "OBJECTION", "ERASURE"]);

export async function requestDataRight(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const requestType = String(formData.get("requestType") || "").toUpperCase();
  if (!permittedRights.has(requestType)) redirect("/settings?rightsError=invalid");
  await prisma.auditEvent.create({
    data: { companyId: user.companyId, userId: user.id, action: "DATA_RIGHTS_REQUESTED", entity: "User", entityId: user.id, metadata: { requestType, status: "RECEIVED" } },
  });
  redirect(`/settings?rightsRequested=${requestType.toLowerCase()}`);
}

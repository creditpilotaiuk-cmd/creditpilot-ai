"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function saveCompanySettings(formData: FormData) { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); if (!user) redirect("/login"); const name = String(formData.get("name") || "").trim(); const billingEmail = String(formData.get("billingEmail") || "").trim(); const personalName = String(formData.get("personalName") || "").trim(); if (!name || !personalName) redirect("/settings?error=name"); await prisma.company.update({ where: { id: user.companyId }, data: { name, billingEmail: billingEmail || null } }); await prisma.user.update({ where: { id: user.id }, data: { name: personalName } }); redirect("/settings?saved=1"); }

export async function requestAccountDeletion() { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); if (!user) redirect("/login"); await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "ACCOUNT_DELETION_REQUESTED", entity: "Company", entityId: user.companyId } }); redirect("/settings?deletionRequested=1"); }

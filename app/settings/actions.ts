"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function saveCompanySettings(formData: FormData) { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); if (!user) redirect("/login"); const name = String(formData.get("name") || "").trim(); const billingEmail = String(formData.get("billingEmail") || "").trim(); if (!name) redirect("/settings?error=name"); await prisma.company.update({ where: { id: user.companyId }, data: { name, billingEmail: billingEmail || null } }); redirect("/settings?saved=1"); }

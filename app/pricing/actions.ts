"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function requestCancellation() { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); if (!user) redirect("/login"); await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "CANCELLATION_REQUESTED", entity: "Company", entityId: user.companyId, metadata: { requestedAt: new Date().toISOString() } } }); redirect("/pricing?cancelled=1"); }

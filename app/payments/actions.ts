"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function markInvoicePaid(formData: FormData) { const session = await auth(); if (!session?.user?.email) redirect("/login"); const user = await prisma.user.findUnique({ where: { email: session.user.email } }); const invoiceId = formData.get("invoiceId"); if (!user || typeof invoiceId !== "string") redirect("/payments"); await prisma.invoice.updateMany({ where: { id: invoiceId, companyId: user.companyId, status: { not: "PAID" } }, data: { status: "PAID", paidAt: new Date() } }); redirect("/payments?paid=1"); }

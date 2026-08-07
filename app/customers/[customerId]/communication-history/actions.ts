"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

export async function logPhoneCall(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customerId = value(formData, "customerId");
  const outcome = value(formData, "outcome");
  const direction = value(formData, "direction") || "Outbound";
  if (!customerId || outcome.length < 3) redirect(`/customers/${customerId}/communication-history?error=call`);
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId } });
  if (!customer) redirect("/customers");
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "PHONE_CALL_LOGGED", entity: "Customer", entityId: customer.id, metadata: { previousValue: null, newValue: { direction, outcome }, ipAddress: null } } });
  redirect(`/customers/${customer.id}/communication-history?call=1`);
}

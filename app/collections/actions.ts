"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateCollectionWorkflow(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const invoiceId = String(formData.get("invoiceId") || "");
  const ownerId = String(formData.get("ownerId") || "");
  const nextAction = String(formData.get("nextAction") || "").trim();
  const nextActionAt = String(formData.get("nextActionAt") || "");
  const completed = formData.get("completed") === "on";
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: user.companyId } });
  if (!invoice) redirect("/collections?error=case");

  const owner = ownerId ? await prisma.user.findFirst({ where: { id: ownerId, companyId: user.companyId } }) : null;
  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        collectionOwnerId: owner?.id || null,
        nextAction: nextAction || null,
        nextActionAt: nextActionAt ? new Date(`${nextActionAt}T12:00:00`) : null,
        nextActionCompletedAt: completed ? new Date() : null,
      },
    }),
    prisma.auditEvent.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: completed ? "NEXT_ACTION_COMPLETED" : "COLLECTION_WORKFLOW_UPDATED",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: { newValue: { ownerId: owner?.id || null, nextAction: nextAction || null, nextActionAt: nextActionAt || null, completed } },
      },
    }),
  ]);
  redirect("/collections?saved=1");
}


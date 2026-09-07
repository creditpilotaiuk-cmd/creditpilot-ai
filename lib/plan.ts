import { prisma } from "@/lib/prisma";

export const STARTER_INVOICE_LIMIT = 150;
export const GROWTH_INVOICE_LIMIT = 750;
export const PROFESSIONAL_INVOICE_LIMIT = 2500;

export async function invoiceLimitReached(companyId: string, additional = 1) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      plan: true,
      billingEntitlements: {
        where: { status: { in: ["active", "trialing", "past_due"] }, kind: { in: ["extra-250-invoices", "extra-1000-invoices"] } },
        select: { kind: true, quantity: true },
      },
    },
  });
  const plan = (company?.plan ?? "BETA").toUpperCase();
  const limit = plan === "PROFESSIONAL" ? PROFESSIONAL_INVOICE_LIMIT : plan === "GROWTH" ? GROWTH_INVOICE_LIMIT : plan === "STARTER" ? STARTER_INVOICE_LIMIT : null;
  if (!limit) return false;
  const addOnCapacity = (company?.billingEntitlements ?? []).reduce((total, entitlement) => total + entitlement.quantity * (entitlement.kind === "extra-1000-invoices" ? 1000 : 250), 0);
  const activeInvoices = await prisma.invoice.count({ where: { companyId, status: { notIn: ["PAID", "VOID", "WRITTEN_OFF"] } } });
  return activeInvoices + additional > limit + addOnCapacity;
}


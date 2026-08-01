import { prisma } from "@/lib/prisma";

export const STARTER_INVOICE_LIMIT = 100;
export const GROWTH_INVOICE_LIMIT = 500;

export async function invoiceLimitReached(companyId: string, additional = 1) {
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { plan: true } });
  const plan = (company?.plan ?? "BETA").toUpperCase();
  const limit = plan === "GROWTH" ? GROWTH_INVOICE_LIMIT : plan === "STARTER" || plan === "BETA" ? STARTER_INVOICE_LIMIT : null;
  if (!limit) return false;
  const activeInvoices = await prisma.invoice.count({ where: { companyId, status: { in: ["DRAFT", "SENT", "OUTSTANDING", "OVERDUE", "PAID"] } } });
  return activeInvoices + additional > limit;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, companyId: true, name: true, email: true, role: true, createdAt: true } });
  if (!user) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const [company, customers, invoices, reminders, promises, recommendations, auditEvents] = await Promise.all([
    prisma.company.findUnique({ where: { id: user.companyId }, select: { id: true, name: true, slug: true, billingEmail: true, plan: true, paymentMethods: true, createdAt: true, updatedAt: true } }),
    prisma.customer.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.invoice.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.reminder.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.paymentPromise.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.aIRecommendation.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "asc" } }),
  ]);
  await prisma.auditEvent.create({ data: { companyId: user.companyId, userId: user.id, action: "WORKSPACE_DATA_EXPORTED", entity: "Company", entityId: user.companyId } });
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), formatVersion: 1, user, company, customers, invoices, reminders, paymentPromises: promises, recommendations, auditEvents }, null, 2);
  return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="creditpilot-data-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store" } });
}

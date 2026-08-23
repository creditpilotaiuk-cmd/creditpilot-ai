import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Building2, FileText, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export const dynamic = "force-dynamic";

const dateTime = (value: Date) => value.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function PlatformAdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, companyId: true, isPlatformAdmin: true } });
  if (!admin?.isPlatformAdmin) redirect("/dashboard");

  const [companies, activity] = await Promise.all([
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        createdAt: true,
        users: { select: { name: true, email: true, createdAt: true }, orderBy: { createdAt: "asc" } },
        _count: { select: { customers: true, invoices: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditEvent.groupBy({ by: ["companyId"], _max: { createdAt: true }, _count: { _all: true } }),
  ]);

  const activityByCompany = new Map(activity.map(item => [item.companyId, item]));
  const now = Date.now();
  const rows = companies.map(company => {
    const latest = activityByCompany.get(company.id);
    const lastActivity = latest?._max.createdAt || company.createdAt;
    const daysSinceActivity = Math.floor((now - lastActivity.getTime()) / 86_400_000);
    return { ...company, lastActivity, actionCount: latest?._count._all || 0, active: daysSinceActivity <= 30, needsFollowUp: daysSinceActivity >= 7 };
  });

  const userCount = rows.reduce((sum, company) => sum + company.users.length, 0);
  const invoiceCount = rows.reduce((sum, company) => sum + company._count.invoices, 0);
  const activeCount = rows.filter(company => company.active).length;

  await prisma.auditEvent.create({ data: { companyId: admin.companyId, userId: admin.id, action: "PLATFORM_ADMIN_VIEWED", entity: "Platform", metadata: { companyCount: rows.length } } });

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-violet-600">Private platform administration</p><h1 className="text-xl font-bold tracking-tight text-ink">CreditPilot Admin</h1></header><div className="mx-auto max-w-7xl p-5 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Beta overview</p><h2 className="mt-1 text-3xl font-bold text-ink">Customer adoption and activity</h2><p className="mt-2 max-w-2xl text-slate-600">Operational account information only. Customer invoice details remain isolated inside each workspace.</p></div><Link href="/dashboard" className="button-secondary">Return to your workspace</Link></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Building2} label="Registered businesses" value={rows.length} /><Metric icon={Users} label="Registered users" value={userCount} /><Metric icon={Activity} label="Active businesses" value={activeCount} /><Metric icon={FileText} label="Invoices added" value={invoiceCount} /></section>
    <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"><div className="border-b p-5"><h3 className="font-bold text-ink">Beta businesses</h3><p className="mt-1 text-sm text-slate-500">Registration, usage totals and follow-up status across CreditPilot.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Business</th><th className="px-5 py-3">Registered</th><th className="px-5 py-3">Last activity</th><th className="px-5 py-3">Usage</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y">{rows.map(company => <tr key={company.id} className="align-top"><td className="px-5 py-4"><p className="font-semibold text-ink">{company.name}</p><p className="mt-1 text-xs text-slate-500">{company.users[0]?.name || "Account owner"} · {company.users[0]?.email || "No email"}</p><p className="mt-1 text-xs font-medium text-electric">{company.plan}</p></td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{dateTime(company.createdAt)}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{dateTime(company.lastActivity)}</td><td className="px-5 py-4 text-slate-600"><p>{company._count.customers} customers · {company._count.invoices} invoices</p><p className="mt-1 text-xs">{company.actionCount} recorded actions</p></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${company.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{company.active ? "Active" : "Inactive"}</span>{company.needsFollowUp && <p className="mt-2 text-xs font-semibold text-amber-700">Follow-up recommended</p>}</td></tr>)}</tbody></table></div></section>
  </div></div></main>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) { return <div className="rounded-xl border bg-white p-5 shadow-card"><Icon className="text-violet-600" size={20} /><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-ink">{value}</p></div>; }

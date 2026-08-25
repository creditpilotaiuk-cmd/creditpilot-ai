import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export const dynamic = "force-dynamic";
const money = (n: unknown) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const invoices = await prisma.invoice.findMany({ where: { companyId: user.companyId }, include: { customer: true }, orderBy: { amount: "desc" } });
  const [reminders, promises] = await Promise.all([prisma.reminder.findMany({ where: { companyId: user.companyId } }), prisma.paymentPromise.findMany({ where: { companyId: user.companyId } })]);
  const outstanding = invoices.filter(i => ["OUTSTANDING", "OVERDUE", "SENT"].includes(i.status));
  const paid = invoices.filter(i => i.status === "PAID");
  const overdue = invoices.filter(i => i.status === "OVERDUE");
  const totalOutstanding = outstanding.reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = paid.reduce((s, i) => s + Number(i.amount), 0);
  const now = Date.now();
  const ageing = [
    ["0–30 days", overdue.filter(i => now - i.dueDate.getTime() <= 30 * 86400000)],
    ["31–60 days", overdue.filter(i => { const d = now - i.dueDate.getTime(); return d > 30 * 86400000 && d <= 60 * 86400000; })],
    ["61–90 days", overdue.filter(i => { const d = now - i.dueDate.getTime(); return d > 60 * 86400000 && d <= 90 * 86400000; })],
    ["90+ days", overdue.filter(i => now - i.dueDate.getTime() > 90 * 86400000)],
  ].map(([label, items]) => ({ label: label as string, count: (items as typeof invoices).length, amount: (items as typeof invoices).reduce((s, i) => s + Number(i.amount), 0) }));
  const sent = reminders.filter(r => r.status === "SENT").length;
  const keptPromises = promises.filter(p => p.status === "KEPT").length;
  const brokenPromises = promises.filter(p => p.status === "BROKEN").length;
  const promiseKeptRate = keptPromises + brokenPromises ? Math.round(keptPromises / (keptPromises + brokenPromises) * 100) : 0;
  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Collection performance</p><h1 className="text-xl font-bold text-ink">Collection analytics</h1></header><div className="mx-auto max-w-7xl p-5 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Live operational reporting</p><h2 className="mt-1 text-3xl font-bold text-ink">See how collection work changes outcomes.</h2><p className="mt-2 text-slate-600">Track debt movement, chase activity and customer commitments while the ledger remains your financial record.</p></div><a href="/reports" className="button-secondary">Refresh analytics</a></div><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Card label="Total outstanding" value={money(totalOutstanding)} /><Card label="Overdue cases" value={`${overdue.length}`} /><Card label="Paid to date" value={money(totalPaid)} /><Card label="Chases sent" value={`${sent}`} /><Card label="Promise kept rate" value={`${promiseKeptRate}%`} /></section><section className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_1fr]"><div className="rounded-xl border bg-white p-6 shadow-card"><h3 className="text-lg font-bold text-ink">Invoice ageing</h3><p className="mt-1 text-sm text-slate-500">Overdue balances grouped by age.</p><div className="mt-6 space-y-5">{ageing.map((row) => <div key={row.label}><div className="flex justify-between text-sm"><span className="font-medium text-ink">{row.label} <span className="text-slate-400">({row.count})</span></span><span className="font-semibold text-ink">{money(row.amount)}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-electric" style={{ width: `${totalOutstanding ? Math.min(100, Math.max(3, row.amount / totalOutstanding * 100)) : 0}%` }} /></div></div>)}</div></div><div className="rounded-xl border bg-white p-6 shadow-card"><h3 className="text-lg font-bold text-ink">Collection snapshot</h3><div className="mt-5 space-y-4"><Metric label="Invoices in workspace" value={`${invoices.length}`} /><Metric label="Outstanding balance" value={money(totalOutstanding)} /><Metric label="Payment rate" value={`${invoices.length ? Math.round(paid.length / invoices.length * 100) : 0}%`} /><Metric label="Chase activity" value={`${reminders.length} total · ${sent} sent`} /><Metric label="Broken promises" value={`${brokenPromises}`} /></div></div></section><section className="mt-6 rounded-xl border bg-white p-6 shadow-card"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold text-ink">Largest outstanding balances</h3><p className="mt-1 text-sm text-slate-500">Prioritise high-value accounts first.</p></div><a href="/invoices" className="text-sm font-semibold text-electric">View invoices</a></div><div className="mt-4 divide-y">{outstanding.slice(0, 8).map(i => <div key={i.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-ink">{i.customer.name}</p><p className="text-sm text-slate-500">{i.number} · {i.status.toLowerCase()}</p></div><p className="font-semibold text-ink">{money(i.amount)}</p></div>)}{!outstanding.length && <p className="py-4 text-sm text-slate-500">No outstanding invoices.</p>}</div></section></div></div></main>;
}
function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border bg-white p-5 shadow-card"><div className="mb-4 h-2 w-10 rounded-full bg-electric" /><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-ink">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b pb-3 text-sm"><span className="text-slate-500">{label}</span><span className="font-bold text-ink">{value}</span></div>; }

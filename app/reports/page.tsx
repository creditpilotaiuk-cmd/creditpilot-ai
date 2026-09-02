import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, CircleDollarSign, Clock3, MailCheck, RefreshCw, Sparkles, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export const dynamic = "force-dynamic";
const money = (n: unknown) => Number(n || 0).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const invoices = await prisma.invoice.findMany({ where: { companyId: user.companyId }, include: { customer: true }, orderBy: { amount: "desc" } });
  const [reminders, promises] = await Promise.all([
    prisma.reminder.findMany({ where: { companyId: user.companyId } }),
    prisma.paymentPromise.findMany({ where: { companyId: user.companyId } }),
  ]);

  const outstanding = invoices.filter(invoice => ["OUTSTANDING", "OVERDUE", "SENT"].includes(invoice.status));
  const paid = invoices.filter(invoice => invoice.status === "PAID");
  const overdue = invoices.filter(invoice => invoice.status === "OVERDUE");
  const totalOutstanding = outstanding.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const totalPaid = paid.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const paymentRate = invoices.length ? Math.round(paid.length / invoices.length * 100) : 0;
  const now = Date.now();

  const ageing = [
    ["0–30 days", overdue.filter(invoice => now - invoice.dueDate.getTime() <= 30 * 86400000), "from-cyan-400 to-blue-500"],
    ["31–60 days", overdue.filter(invoice => { const days = now - invoice.dueDate.getTime(); return days > 30 * 86400000 && days <= 60 * 86400000; }), "from-blue-500 to-violet-500"],
    ["61–90 days", overdue.filter(invoice => { const days = now - invoice.dueDate.getTime(); return days > 60 * 86400000 && days <= 90 * 86400000; }), "from-amber-400 to-orange-500"],
    ["90+ days", overdue.filter(invoice => now - invoice.dueDate.getTime() > 90 * 86400000), "from-orange-500 to-rose-500"],
  ].map(([label, items, colour]) => ({
    label: label as string,
    count: (items as typeof invoices).length,
    amount: (items as typeof invoices).reduce((sum, invoice) => sum + Number(invoice.amount), 0),
    colour: colour as string,
  }));

  const sent = reminders.filter(reminder => reminder.status === "SENT").length;
  const keptPromises = promises.filter(promise => promise.status === "KEPT").length;
  const brokenPromises = promises.filter(promise => promise.status === "BROKEN").length;
  const promiseKeptRate = keptPromises + brokenPromises ? Math.round(keptPromises / (keptPromises + brokenPromises) * 100) : 0;
  const oldestRisk = ageing[3].amount + ageing[2].amount;
  const collectionHealth = overdue.length === 0 ? "On track" : oldestRisk > 0 ? "Action required" : "Monitor closely";
  const healthClass = overdue.length === 0 ? "text-emerald-300" : oldestRisk > 0 ? "text-rose-300" : "text-amber-300";

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Collection performance</p>
        <h1 className="text-xl font-bold text-ink">Collection analytics</h1>
      </header>

      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><BarChart3 size={14} />Live operational reporting</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">See where cash is moving—and where action is needed.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Track debt exposure, collection activity and customer commitments while your accounting ledger remains the financial record.</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Link href="/reports" className="inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"><RefreshCw className="mr-2" size={16} />Refresh analytics</Link>
              <div className="text-right"><p className="text-xs text-blue-200">Collection health</p><p className={`mt-1 font-bold ${healthClass}`}>{collectionHealth}</p></div>
            </div>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi icon={CircleDollarSign} label="Outstanding" value={money(totalOutstanding)} note={`${outstanding.length} open invoices`} colour="text-cyan-300" />
            <Kpi icon={AlertTriangle} label="Overdue cases" value={String(overdue.length)} note={money(overdue.reduce((sum, invoice) => sum + Number(invoice.amount), 0))} colour="text-amber-300" />
            <Kpi icon={CheckCircle2} label="Paid to date" value={money(totalPaid)} note={`${paymentRate}% payment rate`} colour="text-emerald-300" />
            <Kpi icon={MailCheck} label="Chases sent" value={String(sent)} note={`${reminders.length} created`} colour="text-blue-200" />
            <Kpi icon={Target} label="Promise kept" value={`${promiseKeptRate}%`} note={`${brokenPromises} broken`} colour="text-violet-200" />
          </div>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Ageing risk</p><h3 className="mt-1 text-xl font-bold text-ink">Where overdue cash is sitting</h3><p className="mt-1 text-sm text-slate-500">Older balances require stronger and faster follow-up.</p></div><Clock3 className="text-blue-500" size={24} /></div>
            <div className="mt-7 space-y-6">{ageing.map(row => {
              const percentage = totalOutstanding ? Math.min(100, row.amount / totalOutstanding * 100) : 0;
              return <div key={row.label}>
                <div className="flex items-end justify-between gap-4"><div><p className="font-bold text-ink">{row.label}</p><p className="mt-0.5 text-xs text-slate-400">{row.count} invoice{row.count === 1 ? "" : "s"}</p></div><div className="text-right"><p className="font-bold text-ink">{money(row.amount)}</p><p className="text-xs text-slate-400">{Math.round(percentage)}% of open balance</p></div></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full bg-gradient-to-r ${row.colour} transition-all duration-700`} style={{ width: `${percentage ? Math.max(4, percentage) : 0}%` }} /></div>
              </div>;
            })}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-xl shadow-slate-200/60 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Collection snapshot</p>
            <h3 className="mt-1 text-xl font-bold text-ink">Performance at a glance</h3>
            <div className="mt-6 space-y-3">
              <Snapshot label="Invoices in workspace" value={String(invoices.length)} icon={BarChart3} colour="bg-blue-100 text-blue-700" />
              <Snapshot label="Payment rate" value={`${paymentRate}%`} icon={TrendingUp} colour="bg-emerald-100 text-emerald-700" />
              <Snapshot label="Chase activity" value={`${sent} of ${reminders.length} sent`} icon={MailCheck} colour="bg-violet-100 text-violet-700" />
              <Snapshot label="Broken promises" value={String(brokenPromises)} icon={AlertTriangle} colour="bg-amber-100 text-amber-700" />
            </div>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 shrink-0 text-electric" size={18} /><div><p className="font-bold text-ink">Recommended focus</p><p className="mt-1 text-sm leading-6 text-slate-600">{overdue.length === 0 ? "There are no overdue cases. Keep monitoring upcoming due dates and promises." : oldestRisk > 0 ? `Review the ${ageing[2].count + ageing[3].count} invoices overdue by more than 60 days first.` : "Prioritise overdue cases and any broken payment promises today."}</p></div></div></div>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Value at risk</p><h3 className="mt-1 text-xl font-bold text-ink">Largest outstanding balances</h3><p className="mt-1 text-sm text-slate-500">Start with high-value accounts where focused action can have the greatest impact.</p></div>
            <Link href="/invoices" className="inline-flex items-center gap-2 text-sm font-bold text-electric">View all invoices <ArrowRight size={16} /></Link>
          </div>
          {outstanding.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">{outstanding.slice(0, 8).map((invoice, index) => <Link href="/invoices" key={invoice.id} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-start justify-between gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">{index + 1}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${invoice.status === "OVERDUE" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{invoice.status.toLowerCase()}</span></div>
            <p className="mt-4 truncate font-bold text-ink">{invoice.customer.name}</p><p className="mt-1 text-xs text-slate-500">{invoice.number}</p><p className="mt-4 text-xl font-bold text-ink">{money(invoice.amount)}</p>
          </Link>)}</div> : <div className="p-12 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={34} /><p className="mt-4 font-bold text-ink">No outstanding invoices</p><p className="mt-1 text-sm text-slate-500">All recorded invoices are currently paid.</p></div>}
        </section>
      </div>
    </div>
  </main>;
}

function Kpi({ icon: Icon, label, value, note, colour }: { icon: LucideIcon; label: string; value: string; note: string; colour: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><div className={`flex items-center gap-2 ${colour}`}><Icon size={17} /><p className="text-xs font-semibold text-blue-100">{label}</p></div><p className="mt-3 text-xl font-bold text-white">{value}</p><p className="mt-1 text-[11px] font-semibold text-blue-200">{note}</p></div>;
}

function Snapshot({ label, value, icon: Icon, colour }: { label: string; value: string; icon: LucideIcon; colour: string }) {
  return <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${colour}`}><Icon size={17} /></span><span className="text-sm font-medium text-slate-600">{label}</span></div><span className="font-bold text-ink">{value}</span></div>;
}

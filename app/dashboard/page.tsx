import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, Bot, CalendarClock, CheckCircle2, CircleDollarSign, Clock3, FileText, Plus, ReceiptText, Send, Sparkles, TrendingUp, Users, Zap, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { TimeGreeting } from "@/components/time-greeting";

export const dynamic = "force-dynamic";
const money = (n: unknown) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
const date = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const now = new Date();
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
  const [invoices, customerCount, recentReminders, promises] = await Promise.all([
    prisma.invoice.findMany({ where: { companyId: user.companyId }, include: { customer: true }, orderBy: { dueDate: "asc" } }),
    prisma.customer.count({ where: { companyId: user.companyId } }),
    prisma.reminder.findMany({ where: { companyId: user.companyId }, include: { customer: true, invoice: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.paymentPromise.findMany({ where: { companyId: user.companyId, status: "OPEN" }, include: { customer: true }, orderBy: { promisedFor: "asc" }, take: 5 }),
  ]);
  const collectibleStatuses = ["SENT", "OUTSTANDING", "OVERDUE", "DISPUTED", "ON_HOLD", "PAYMENT_PLAN", "LEGAL_ESCALATION"];
  const activeInvoices = invoices.filter(i => collectibleStatuses.includes(i.status));
  const dueSoon = activeInvoices.filter(i => i.dueDate >= now && i.dueDate <= nextWeek);
  const overdue = activeInvoices.filter(i => i.dueDate < now);
  const outstanding = activeInvoices.reduce((n, i) => n + Number(i.amount), 0);
  const paid = invoices.filter(i => i.status === "PAID").reduce((n, i) => n + Number(i.amount), 0);
  const overdueValue = overdue.reduce((n, i) => n + Number(i.amount), 0);
  const priority = [...overdue]
    .sort((a, b) => {
      const aScore = Number(a.amount) + (a.customer.riskLevel === "HIGH" ? 100000 : a.customer.riskLevel === "MEDIUM" ? 50000 : 0);
      const bScore = Number(b.amount) + (b.customer.riskLevel === "HIGH" ? 100000 : b.customer.riskLevel === "MEDIUM" ? 50000 : 0);
      return bScore - aScore;
    })
    .slice(0, 5);
  const ageing = [0, 0, 0, 0];
  overdue.forEach(i => { const days = Math.max(0, Math.floor((now.getTime() - i.dueDate.getTime()) / 86400000)); ageing[days < 31 ? 0 : days < 61 ? 1 : days < 91 ? 2 : 3] += Number(i.amount); });
  const firstName = user.name?.split(" ")[0] || "there";
  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace · {user.company.name}</p><TimeGreeting firstName={firstName} /></header>

      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-7">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><Sparkles size={14} />System of action</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Your credit-control overview</h2>
              <p className="mt-3 max-w-2xl leading-7 text-blue-100">Your accounting software records the numbers. CreditPilot organises what your team should do next.</p>
            </div>
            <Link href="/collections" className="inline-flex items-center rounded-xl bg-white px-5 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Open Today&apos;s Chase List <ArrowRight className="ml-2" size={17} /></Link>
          </div>
          <div className="relative mt-7 flex flex-wrap gap-3">
            {user.isPlatformAdmin && <Link href="/admin" className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"><Zap className="mr-2" size={16} />Platform Admin</Link>}
            <Link href="/customers" className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"><Plus className="mr-2" size={16} />Add customer</Link>
            <Link href="/invoices" className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"><FileText className="mr-2" size={16} />Import invoice data</Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card icon={CircleDollarSign} label="Total outstanding" value={money(outstanding)} detail={`${activeInvoices.length} open invoice${activeInvoices.length === 1 ? "" : "s"}`} tone="blue" />
          <Card icon={AlertTriangle} label="Overdue" value={money(overdueValue)} detail={`${overdue.length} invoice${overdue.length === 1 ? "" : "s"}`} tone="rose" />
          <Card icon={CalendarClock} label="Due this week" value={money(dueSoon.reduce((total, invoice) => total + Number(invoice.amount), 0))} detail={`${dueSoon.length} invoice${dueSoon.length === 1 ? "" : "s"}`} tone="amber" />
          <Card icon={CheckCircle2} label="Paid to date" value={money(paid)} tone="green" />
          <Card icon={Users} label="Customers" value={String(customerCount)} tone="slate" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Today&apos;s action centre</p><h3 className="mt-1 text-xl font-bold text-ink">Highest-priority finance actions</h3><p className="mt-1 text-sm text-slate-500">Prioritised by due date, balance and customer risk.</p></div>
              <Link href="/collections" className="inline-flex items-center gap-2 text-sm font-bold text-electric">Work all actions <ArrowRight size={16} /></Link>
            </div>
            <div className="space-y-3 p-5 sm:p-6">{priority.length ? priority.map((invoice, index) => {
              const days = Math.max(1, Math.floor((now.getTime() - invoice.dueDate.getTime()) / 86400000));
              return <article key={invoice.id} className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-ink">{invoice.customer.name}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${invoice.customer.riskLevel === "HIGH" ? "bg-rose-100 text-rose-700" : invoice.customer.riskLevel === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{invoice.customer.riskLevel} RISK</span></div><p className="mt-1 text-sm text-slate-500">{days} day{days === 1 ? "" : "s"} overdue · Review and contact today</p></div></div>
                <div className="text-right"><p className="text-lg font-bold text-ink">{money(invoice.amount)}</p><Link href="/collections" className="mt-1 inline-flex items-center text-xs font-bold text-electric">Open action <ArrowRight className="ml-1" size={13} /></Link></div>
              </article>;
            }) : <Empty icon={CheckCircle2} title="No overdue actions" text="Review invoices due this week next." />}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-xl shadow-slate-200/60">
            <div className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Alerts and commitments</p><h3 className="mt-2 text-xl font-bold text-ink">Protect every next step</h3><p className="mt-1 text-sm text-slate-500">Important follow-ups and commitments in one place.</p></div>
            <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
              {overdue.length > 0 && <Action icon={AlertTriangle} tone="rose" title={`Follow up ${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}`} href="/collections" />}
              {dueSoon.length > 0 && <Action icon={CalendarClock} tone="amber" title={`${dueSoon.length} invoice${dueSoon.length === 1 ? "" : "s"} due this week`} href="/invoices" />}
              {promises.length > 0 && <Action icon={Clock3} tone="blue" title={`${promises.length} payment promise${promises.length === 1 ? "" : "s"} to monitor`} href="/payments" />}
              <Action icon={Bot} tone="violet" title="Ask Finance AI for a cash-flow answer" href="/copilot" />
              {overdue.length === 0 && dueSoon.length === 0 && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={19} /><div><p className="font-bold text-emerald-800">You&apos;re all caught up</p><p className="mt-1 text-sm text-emerald-700">Great work. Continue monitoring payment promises and new invoices.</p></div></div>}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Exposure by age</p><h3 className="mt-1 text-xl font-bold text-ink">Invoice ageing</h3><p className="mt-1 text-sm text-slate-500">Overdue balance grouped by age.</p></div><Link href="/reports" className="inline-flex items-center gap-2 text-sm font-bold text-electric">View reports <ArrowRight size={16} /></Link></div>
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">{["1–30 days", "31–60 days", "61–90 days", "90+ days"].map((label, index) => {
              const colours = ["from-cyan-400 to-blue-500", "from-blue-500 to-violet-500", "from-amber-400 to-orange-500", "from-orange-500 to-rose-500"];
              const height = Math.max(8, Math.min(100, ageing[index] / Math.max(...ageing, 1) * 100));
              return <div key={label} className="rounded-2xl bg-slate-50 p-3"><div className="flex h-28 items-end rounded-xl bg-white p-2 shadow-inner"><div className={`w-full rounded-lg bg-gradient-to-t ${colours[index]} transition-all duration-700`} style={{ height: `${height}%` }} /></div><p className="mt-3 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold text-ink">{money(ageing[index])}</p></div>;
            })}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Shortcuts</p><h3 className="mt-1 text-xl font-bold text-ink">Quick actions</h3><p className="mt-1 text-sm text-slate-500">Jump straight to frequent tasks.</p>
            <div className="mt-5 space-y-3">
              <Quick icon={Send} href="/statements" text="Send a statement" tone="blue" />
              <Quick icon={CheckCircle2} href="/payments" text="Record a payment" tone="green" />
              <Quick icon={Bot} href="/copilot" text="Ask Copilot" tone="violet" />
              <Quick icon={AlertTriangle} href="/support" text="Report a problem" tone="amber" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel icon={CalendarClock} eyebrow="Upcoming" title="Due in the next 7 days" link="/invoices">{dueSoon.length ? dueSoon.slice(0, 5).map(invoice => <Row key={invoice.id} title={invoice.customer.name} sub={`${invoice.number} · due ${date(invoice.dueDate)}`} value={money(invoice.amount)} />) : <Empty icon={CalendarClock} title="Nothing due this week" text="No invoices are due in the next seven days." />}</Panel>
          <Panel icon={ReceiptText} eyebrow="Latest updates" title="Recent activity" link="/reminders">{recentReminders.length ? recentReminders.map(reminder => <Row key={reminder.id} title={reminder.customer.name} sub={`${reminder.subject} · ${reminder.status.toLowerCase()}`} value={date(reminder.createdAt)} />) : <Empty icon={ReceiptText} title="No reminder activity yet" text="Generated, approved and sent reminders will appear here." />}</Panel>
        </section>
      </div>
    </div>
  </main>;
}

function Card({ icon: Icon, label, value, detail, tone }: { icon: LucideIcon; label: string; value: string; detail?: string; tone: string }) {
  const styles = tone === "rose" ? "bg-rose-100 text-rose-700" : tone === "green" ? "bg-emerald-100 text-emerald-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : tone === "slate" ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700";
  return <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-xl"><span className={`grid h-10 w-10 place-items-center rounded-xl ${styles}`}><Icon size={19} /></span><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-ink">{value}</p>{detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}</div>;
}

function Panel({ icon: Icon, eyebrow, title, link, children }: { icon: LucideIcon; eyebrow: string; title: string; link: any; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"><div className="flex items-center justify-between gap-4 border-b bg-gradient-to-r from-white to-blue-50/60 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-electric"><Icon size={19} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-electric">{eyebrow}</p><h3 className="mt-1 font-bold text-ink">{title}</h3></div></div><Link href={link} className="text-sm font-bold text-electric">View all</Link></div><div className="divide-y p-5 sm:px-6">{children}</div></div>;
}

function Row({ title, sub, value }: { title: string; sub: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-ink">{title}</p><p className="mt-1 text-sm text-slate-500">{sub}</p></div><p className="shrink-0 text-sm font-bold text-ink">{value}</p></div>;
}

function Action({ icon: Icon, tone, title, href }: { icon: LucideIcon; tone: string; title: string; href: any }) {
  const style = tone === "rose" ? "bg-rose-100 text-rose-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : tone === "violet" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700";
  return <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${style}`}><Icon size={17} /></span><span className="font-semibold text-ink">{title}</span><ArrowRight className="ml-auto text-electric transition group-hover:translate-x-1" size={16} /></Link>;
}

function Quick({ icon: Icon, href, text, tone }: { icon: LucideIcon; href: any; text: string; tone: string }) {
  const style = tone === "green" ? "bg-emerald-100 text-emerald-700" : tone === "violet" ? "bg-violet-100 text-violet-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700";
  return <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-blue-300 hover:bg-white hover:shadow-md"><span className={`grid h-9 w-9 place-items-center rounded-xl ${style}`}><Icon size={17} /></span><span className="text-sm font-semibold text-ink">{text}</span><ArrowRight className="ml-auto text-slate-400 transition group-hover:translate-x-1 group-hover:text-electric" size={16} /></Link>;
}

function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="py-6 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon size={20} /></span><p className="mt-3 font-bold text-ink">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div>;
}

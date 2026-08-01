import Link from "next/link";
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
  const [outstanding, overdue, paid, customerCount, dueSoon, priority, recentReminders, promises] = await Promise.all([
    prisma.invoice.aggregate({ where: { companyId: user.companyId, status: { in: ["OUTSTANDING", "OVERDUE"] } }, _sum: { amount: true } }),
    prisma.invoice.count({ where: { companyId: user.companyId, status: "OVERDUE" } }),
    prisma.invoice.aggregate({ where: { companyId: user.companyId, status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.customer.count({ where: { companyId: user.companyId } }),
    prisma.invoice.findMany({ where: { companyId: user.companyId, status: { in: ["OUTSTANDING", "SENT"] }, dueDate: { gte: now, lte: nextWeek } }, include: { customer: true }, orderBy: { dueDate: "asc" }, take: 5 }),
    prisma.invoice.findMany({ where: { companyId: user.companyId, status: "OVERDUE" }, include: { customer: true }, orderBy: { amount: "desc" }, take: 5 }),
    prisma.reminder.findMany({ where: { companyId: user.companyId }, include: { customer: true, invoice: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.paymentPromise.findMany({ where: { companyId: user.companyId, status: "OPEN" }, include: { customer: true }, orderBy: { promisedFor: "asc" }, take: 5 }),
  ]);
  const firstName = user.name?.split(" ")[0] || "there";
  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace · {user.company.name}</p><TimeGreeting firstName={firstName} /></header><div className="mx-auto max-w-7xl p-5 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Owner overview</p><h2 className="mt-1 text-3xl font-bold text-ink">Your cash-flow control centre</h2><p className="mt-2 text-slate-600">A live view of what needs attention today.</p></div><div className="flex gap-3"><Link href="/invoices" className="button-secondary">View invoices</Link><Link href="/reminders" className="button-primary">Send reminders</Link></div></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card label="Total outstanding" value={money(outstanding._sum.amount)} tone="blue" /><Card label="Overdue invoices" value={String(overdue)} tone="rose" /><Card label="Paid to date" value={money(paid._sum.amount)} tone="green" /><Card label="Customers" value={String(customerCount)} tone="slate" /></section>
    <section className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-xl border bg-white p-6 shadow-card"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold text-ink">Invoices requiring attention</h3><p className="mt-1 text-sm text-slate-500">Highest-value overdue accounts first.</p></div><Link href="/invoices" className="text-sm font-semibold text-electric">View all</Link></div><div className="mt-5 space-y-3">{priority.length ? priority.map((i) => <div key={i.id} className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-semibold text-ink">{i.customer.name}</p><p className="text-sm text-slate-500">{i.number} · overdue</p></div><div className="text-right"><p className="font-bold text-ink">{money(i.amount)}</p><Link href="/reminders" className="text-xs font-semibold text-electric">Create reminder →</Link></div></div>) : <Empty text="No overdue invoices." />}</div></div><div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-card"><p className="eyebrow">Today’s action plan</p><h3 className="mt-2 text-xl font-bold text-ink">Make your next move</h3><div className="mt-5 space-y-4 text-sm">{overdue > 0 && <Action dot="bg-rose-500" title={`Follow up ${overdue} overdue invoice${overdue === 1 ? "" : "s"}`} href="/reminders" />}{dueSoon.length > 0 && <Action dot="bg-amber-500" title={`${dueSoon.length} invoice${dueSoon.length === 1 ? "" : "s"} due this week`} href="/invoices" />}{promises.length > 0 && <Action dot="bg-electric" title={`${promises.length} payment promise${promises.length === 1 ? "" : "s"} to monitor`} href="/payments" />}{overdue === 0 && dueSoon.length === 0 && promises.length === 0 && <p className="text-slate-600">You’re all caught up. Great work.</p>}</div></div></section>
    <section className="mt-6 grid gap-6 lg:grid-cols-2"><Panel title="Due in the next 7 days" link="/invoices">{dueSoon.length ? dueSoon.map(i => <Row key={i.id} title={i.customer.name} sub={`${i.number} · due ${date(i.dueDate)}`} value={money(i.amount)} />) : <Empty text="No invoices due this week." />}</Panel><Panel title="Recent activity" link="/reminders">{recentReminders.length ? recentReminders.map(r => <Row key={r.id} title={r.customer.name} sub={`${r.subject} · ${r.status.toLowerCase()}`} value={date(r.createdAt)} />) : <Empty text="No reminder activity yet." />}</Panel></section>
  </div></div></main>;
}
function Card({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="rounded-xl border bg-white p-5 shadow-card"><div className={`mb-4 h-2 w-10 rounded-full ${tone === "rose" ? "bg-rose-400" : tone === "green" ? "bg-emerald-400" : tone === "slate" ? "bg-slate-400" : "bg-electric"}`} /><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-ink">{value}</p></div>; }
function Panel({ title, link, children }: { title: string; link: string; children: React.ReactNode }) { return <div className="rounded-xl border bg-white p-6 shadow-card"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-ink">{title}</h3><Link href={link as any} className="text-sm font-semibold text-electric">View all</Link></div><div className="mt-4 divide-y">{children}</div></div>; }
function Row({ title, sub, value }: { title: string; sub: string; value: string }) { return <div className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-ink">{title}</p><p className="text-sm text-slate-500">{sub}</p></div><p className="shrink-0 text-sm font-semibold text-ink">{value}</p></div>; }
function Action({ dot, title, href }: { dot: string; title: string; href: string }) { return <Link href={href as any} className="flex items-center gap-3 rounded-lg bg-white/80 p-3 transition hover:bg-white"><span className={`h-2.5 w-2.5 rounded-full ${dot}`} /><span className="font-medium text-ink">{title}</span><span className="ml-auto text-electric">→</span></Link>; }
function Empty({ text }: { text: string }) { return <p className="py-5 text-sm text-slate-500">{text}</p>; }

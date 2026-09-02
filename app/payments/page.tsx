import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, CircleDollarSign, Clock3, FileCheck2, HandCoins, ReceiptText, ShieldCheck, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { markInvoicePaid, recordPaymentPromise } from "./actions";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ paid?: string; promise?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const [invoices, promises] = await Promise.all([
    prisma.invoice.findMany({ where: { companyId: user.companyId, status: { not: "PAID" } }, include: { customer: true }, orderBy: { dueDate: "asc" } }),
    prisma.paymentPromise.findMany({ where: { companyId: user.companyId, status: { in: ["OPEN", "BROKEN"] } }, include: { customer: true, invoice: true }, orderBy: { promisedFor: "asc" } }),
  ]);
  const params = await searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const openBalance = invoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
  const overdueInvoices = invoices.filter(invoice => invoice.dueDate < today);
  const overdueBalance = overdueInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
  const openPromises = promises.filter(promise => promise.status === "OPEN");
  const brokenPromises = promises.filter(promise => promise.status === "BROKEN");

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Credit control workspace</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Payments</h1>
      </header>

      <div className="mx-auto max-w-6xl space-y-7 p-5 sm:p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><HandCoins size={14} />Promises & payments</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Keep every payment commitment visible.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">See cash still outstanding, follow up missed commitments and record payment outcomes without losing the collection history.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-100 backdrop-blur-sm"><ShieldCheck className="mr-2 inline text-emerald-300" size={17} />Missed dates are flagged automatically</div>
          </div>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={CircleDollarSign} label="Open balance" value={money(openBalance)} colour="text-cyan-300" />
            <Metric icon={AlertTriangle} label="Overdue balance" value={money(overdueBalance)} colour="text-amber-300" />
            <Metric icon={CalendarClock} label="Open promises" value={String(openPromises.length)} colour="text-blue-200" />
            <Metric icon={Clock3} label="Missed promises" value={String(brokenPromises.length)} colour="text-rose-300" />
          </div>
        </section>

        {params.paid && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={19} />Invoice marked as paid and added to the collection record.</div>}
        {params.promise && <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700"><CalendarClock size={19} />Payment promise recorded. We will flag it automatically if the date is missed.</div>}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-gradient-to-r from-white to-violet-50/70 p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Commitment tracker</p><h2 className="mt-1 text-xl font-bold text-ink">Payment promises</h2><p className="mt-1 text-sm text-slate-500">Prioritise missed promises, then monitor upcoming commitments.</p></div>
            <div className="flex gap-2"><span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">{openPromises.length} open</span><span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">{brokenPromises.length} missed</span></div>
          </div>

          {promises.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">{promises.map(promise => {
            const broken = promise.status === "BROKEN";
            return <article key={promise.id} className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${broken ? "border-rose-200 bg-gradient-to-br from-rose-50 to-white" : "border-blue-200 bg-gradient-to-br from-blue-50 to-white"}`}>
              <div className="flex items-start justify-between gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${broken ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{broken ? <AlertTriangle size={19} /> : <CalendarClock size={19} />}</div><span className={`rounded-full px-3 py-1 text-xs font-bold ${broken ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{broken ? "Follow up now" : "Expected"}</span></div>
              <h3 className="mt-4 font-bold text-ink">{promise.customer.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{promise.invoice?.number || "Invoice"} · promised for {promise.promisedFor.toLocaleDateString("en-GB")}</p>
              <p className="mt-4 text-2xl font-bold text-ink">{money(Number(promise.amount || 0))}</p>
            </article>;
          })}</div> : <div className="p-10 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600"><FileCheck2 size={26} /></div><p className="mt-4 font-bold text-ink">No payment promises yet</p><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">When a customer commits to a date, record it against an outstanding invoice below. CreditPilot will monitor the outcome.</p></div>}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Cash collection</p><h2 className="mt-1 text-xl font-bold text-ink">Outstanding invoices</h2><p className="mt-1 text-sm text-slate-500">Record a promise or close the invoice as paid.</p></div>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">{overdueInvoices.length} overdue</span>
          </div>

          {invoices.length === 0 ? <div className="p-12 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={28} /></div><p className="mt-4 font-bold text-ink">Nothing outstanding</p><p className="mt-1 text-sm text-slate-500">All recorded invoices are currently paid.</p><Link href="/invoices" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-electric">View invoice register <ArrowRight size={16} /></Link></div> :
          <div className="divide-y divide-slate-100">{invoices.map(invoice => {
            const overdue = invoice.dueDate < today;
            const daysOverdue = overdue ? Math.floor((today.getTime() - invoice.dueDate.getTime()) / 86400000) : 0;
            return <article key={invoice.id} className="p-5 transition hover:bg-blue-50/40 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3"><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${overdue ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}><ReceiptText size={20} /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-ink">{invoice.number}</h3>{overdue && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{daysOverdue} days overdue</span>}</div><p className="mt-1 text-sm text-slate-500">{invoice.customer.name} · due {invoice.dueDate.toLocaleDateString("en-GB")}</p><p className="mt-2 text-xl font-bold text-ink">{money(Number(invoice.amount))}</p></div></div>
                <form action={markInvoicePaid}><input type="hidden" name="invoiceId" value={invoice.id} /><button className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100" type="submit"><CheckCircle2 size={16} className="mr-2" />Mark paid</button></form>
              </div>
              <form action={recordPaymentPromise} className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <label className="min-w-[210px] flex-1 text-xs font-bold uppercase tracking-wide text-slate-500">Promised payment date<input type="date" name="promisedFor" required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-ink focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100" min={new Date().toISOString().slice(0, 10)} /></label>
                <button className="button-secondary whitespace-nowrap" type="submit"><CalendarClock size={16} className="mr-2" />Record promise</button>
              </form>
            </article>;
          })}</div>}
        </section>
      </div>
    </div>
  </main>;
}

function Metric({ icon: Icon, label, value, colour }: { icon: LucideIcon; label: string; value: string; colour: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><div className={`flex items-center gap-2 ${colour}`}><Icon size={18} /><span className="text-xl font-bold text-white">{value}</span></div><p className="mt-1 text-xs font-semibold text-blue-100">{label}</p></div>;
}

function money(amount: number) {
  return amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

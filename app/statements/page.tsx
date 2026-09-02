import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CircleDollarSign, FileText, Mail, Printer, ReceiptText, Send, Users, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function StatementsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { companyId: user.companyId },
    include: {
      invoices: {
        where: { status: { not: "PAID" } },
        select: { amount: true, dueDate: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalInvoices = customers.reduce((total, customer) => total + customer.invoices.length, 0);
  const totalOutstanding = customers.reduce((total, customer) => total + customer.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0), 0);
  const overdueInvoices = customers.reduce((total, customer) => total + customer.invoices.filter(invoice => invoice.dueDate < today).length, 0);
  const statementReady = customers.filter(customer => customer.invoices.length > 0).length;

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Credit control workspace</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Customer statements</h1>
      </header>

      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><FileText size={14} />Statement centre</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Give customers one clear view of what they owe.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Open a customer statement to review outstanding invoices, confirm the balance and create a clean printable record.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-100 backdrop-blur-sm"><Printer className="mr-2 inline text-cyan-300" size={17} />Print-ready customer records</div>
          </div>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={CircleDollarSign} label="Outstanding balance" value={money(totalOutstanding)} colour="text-cyan-300" />
            <Metric icon={ReceiptText} label="Open invoices" value={String(totalInvoices)} colour="text-blue-200" />
            <Metric icon={AlertTriangle} label="Overdue invoices" value={String(overdueInvoices)} colour="text-amber-300" />
            <Metric icon={CheckCircle2} label="Statements ready" value={String(statementReady)} colour="text-emerald-300" />
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Customer accounts</p><h2 className="mt-1 text-xl font-bold text-ink">Choose a statement</h2><p className="mt-1 text-sm text-slate-500">Review balances before printing or sharing a statement.</p></div>
            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">{customers.length} customer{customers.length === 1 ? "" : "s"}</span>
          </div>

          {customers.length === 0 ? <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-electric"><Users size={27} /></div>
            <p className="mt-4 font-bold text-ink">No customer statements yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Add a customer and their invoices to create a printable statement.</p>
            <Link href="/customers" className="button-primary mt-5 inline-flex">Add a customer</Link>
          </div> : <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            {customers.map(customer => {
              const balance = customer.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
              const overdue = customer.invoices.filter(invoice => invoice.dueDate < today).length;
              const ready = customer.invoices.length > 0;
              return <Link key={customer.id} href={`/statements/${customer.id}`} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-50 transition group-hover:bg-blue-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-md">{customer.name.slice(0, 1).toUpperCase()}</div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ready ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{ready ? "Statement ready" : "No open balance"}</span>
                </div>
                <h3 className="relative mt-4 text-lg font-bold text-ink">{customer.name}</h3>
                <p className="relative mt-1 flex items-center gap-2 text-sm text-slate-500"><Mail size={14} />{customer.email || "Email address not recorded"}</p>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Outstanding</p><p className="mt-1 font-bold text-ink">{money(balance)}</p></div>
                  <div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Invoices</p><p className="mt-1 font-bold text-ink">{customer.invoices.length}{overdue > 0 && <span className="ml-2 text-xs text-amber-600">· {overdue} overdue</span>}</p></div>
                </div>

                <div className="relative mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Send size={13} />Review before sharing</span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-electric">Open statement <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
                </div>
              </Link>;
            })}
          </div>}
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

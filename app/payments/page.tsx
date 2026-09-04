import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, HandCoins, ReceiptText } from "lucide-react";
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
    prisma.invoice.findMany({
      where: { companyId: user.companyId, status: { not: "PAID" } },
      include: { customer: true },
      orderBy: [{ customer: { name: "asc" } }, { dueDate: "asc" }],
    }),
    prisma.paymentPromise.findMany({
      where: { companyId: user.companyId, status: { in: ["OPEN", "BROKEN"] } },
      include: { invoice: true },
      orderBy: { promisedFor: "asc" },
    }),
  ]);
  const params = await searchParams;
  const accounts = Array.from(new Map(invoices.map((invoice) => [invoice.customerId, invoice.customer])).values());

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Credit control workspace</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Promises & payments</h1>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>

        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-lg shadow-blue-100/50 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700"><HandCoins size={14} />Account records</span>
          <h2 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">Record promises and received payments.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose an account below, then record the promised payment date or confirm that an invoice has been paid. Every update stays linked to that customer account.</p>
        </section>

        {params.paid && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={19} />Payment recorded against the account.</div>}
        {params.promise && <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700"><CalendarClock size={19} />Payment promise recorded against the account.</div>}

        {accounts.length === 0 ? <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <CheckCircle2 className="mx-auto text-emerald-500" size={34} />
          <h2 className="mt-4 text-xl font-bold text-ink">No outstanding accounts</h2>
          <p className="mt-2 text-sm text-slate-500">There are no open invoices requiring a promise or payment update.</p>
        </section> : <div className="space-y-5">{accounts.map((account) => {
          const accountInvoices = invoices.filter((invoice) => invoice.customerId === account.id);
          const accountPromises = promises.filter((promise) => accountInvoices.some((invoice) => invoice.id === promise.invoiceId));
          const accountBalance = accountInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
          return <section key={account.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-electric">Customer account</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{account.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{account.email || "No email recorded"} · {accountInvoices.length} open invoice{accountInvoices.length === 1 ? "" : "s"}</p>
              </div>
              <div className="text-right"><p className="text-xs font-semibold text-slate-500">Account balance</p><p className="mt-1 text-2xl font-bold text-ink">{money(accountBalance)}</p></div>
            </div>

            {accountPromises.length > 0 && <div className="border-b border-blue-100 bg-blue-50/60 px-5 py-4 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Recorded promises</p>
              <div className="mt-2 flex flex-wrap gap-2">{accountPromises.map((promise) => <span key={promise.id} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${promise.status === "BROKEN" ? "bg-rose-100 text-rose-700" : "bg-white text-blue-700"}`}>{promise.invoice?.number || "Invoice"} · {money(Number(promise.amount || 0))} · {promise.promisedFor.toLocaleDateString("en-GB")}{promise.status === "BROKEN" ? " · missed" : ""}</span>)}</div>
            </div>}

            <div className="divide-y divide-slate-100">{accountInvoices.map((invoice) => <article key={invoice.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700"><ReceiptText size={19} /></span><div><h3 className="font-bold text-ink">{invoice.number}</h3><p className="text-sm text-slate-500">Due {invoice.dueDate.toLocaleDateString("en-GB")}</p></div></div>
                <p className="text-xl font-bold text-ink">{money(Number(invoice.amount))}</p>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                <form action={recordPaymentPromise} className="flex flex-wrap items-end gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                  <input type="hidden" name="invoiceId" value={invoice.id} />
                  <label className="min-w-[210px] flex-1 text-xs font-bold uppercase tracking-wide text-slate-500">Promised payment date<input type="date" name="promisedFor" required min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-ink focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100" /></label>
                  <button className="button-secondary whitespace-nowrap" type="submit"><CalendarClock className="mr-2" size={16} />Record promise</button>
                </form>
                <form action={markInvoicePaid} className="flex">
                  <input type="hidden" name="invoiceId" value={invoice.id} />
                  <button className="inline-flex min-h-full items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700" type="submit"><CheckCircle2 className="mr-2" size={17} />Record payment</button>
                </form>
              </div>
            </article>)}</div>
          </section>;
        })}</div>}
      </div>
    </div>
  </main>;
}

function money(amount: number) {
  return amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

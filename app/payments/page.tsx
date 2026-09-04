import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, CreditCard, HandCoins, History } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { recordAccountPayment, recordAccountPromise } from "./actions";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ payment?: string; promise?: string; error?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const [customers, invoices, promises, paymentEvents] = await Promise.all([
    prisma.customer.findMany({ where: { companyId: user.companyId }, orderBy: { name: "asc" } }),
    prisma.invoice.findMany({ where: { companyId: user.companyId }, include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.paymentPromise.findMany({ where: { companyId: user.companyId }, include: { customer: true, invoice: true }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, action: "ACCOUNT_PAYMENT_RECORDED" }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

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
          <h2 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">Record every promise and incoming payment.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Both tools remain available even when an account has no outstanding invoice. Select the customer account and optionally link the entry to an invoice.</p>
        </section>

        {params.promise && <Notice icon={CalendarClock} text="Payment promise recorded against the selected account." colour="blue" />}
        {params.payment && <Notice icon={CheckCircle2} text="Incoming payment recorded against the selected account." colour="emerald" />}
        {params.error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">Please complete the required account, amount and date fields.</div>}

        {customers.length === 0 ? <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card"><h2 className="text-xl font-bold text-ink">Add a customer first</h2><p className="mt-2 text-sm text-slate-500">Promises and payments must be linked to a customer account.</p><Link href="/customers" className="button-primary mt-5">Add customer</Link></section> :
        <section className="grid gap-5 lg:grid-cols-2">
          <form action={recordAccountPromise} className="rounded-3xl border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700"><CalendarClock size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">Commitment</p><h2 className="text-xl font-bold text-ink">Record a payment promise</h2></div></div>
            <div className="mt-6 space-y-4">
              <Field label="Customer account"><select name="customerId" required className={inputClass}><option value="">Choose an account</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
              <Field label="Invoice (optional)"><select name="invoiceId" className={inputClass}><option value="">Account-level promise</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.customer.name} · {invoice.number} · {money(Number(invoice.amount))}</option>)}</select></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Promised amount (£)"><input name="amount" type="number" min="0.01" step="0.01" required className={inputClass} /></Field><Field label="Promised date"><input name="promisedFor" type="date" min={today} required className={inputClass} /></Field></div>
              <Field label="Notes (optional)"><textarea name="notes" rows={3} className={inputClass} placeholder="Agreed by phone, payment reference…" /></Field>
            </div>
            <button className="button-primary mt-5 w-full justify-center" type="submit"><CalendarClock className="mr-2" size={17} />Record promise</button>
          </form>

          <form action={recordAccountPayment} className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CreditCard size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Cash received</p><h2 className="text-xl font-bold text-ink">Record an incoming payment</h2></div></div>
            <div className="mt-6 space-y-4">
              <Field label="Customer account"><select name="customerId" required className={inputClass}><option value="">Choose an account</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
              <Field label="Invoice (optional)"><select name="invoiceId" className={inputClass}><option value="">Account-level payment</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.customer.name} · {invoice.number} · {money(Number(invoice.amount))}</option>)}</select></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Amount received (£)"><input name="amount" type="number" min="0.01" step="0.01" required className={inputClass} /></Field><Field label="Date received"><input name="receivedOn" type="date" max={today} defaultValue={today} required className={inputClass} /></Field></div>
              <Field label="Reference (optional)"><input name="reference" className={inputClass} placeholder="Bank reference or receipt note" /></Field>
              <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-3 text-sm text-slate-600"><input name="settlesInvoice" type="checkbox" className="mt-0.5 h-4 w-4 accent-emerald-600" /><span><strong className="text-ink">Mark the selected invoice as fully paid</strong><br />Leave unticked for a partial or account-level payment.</span></label>
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700" type="submit"><CheckCircle2 className="mr-2" size={17} />Record payment</button>
          </form>
        </section>}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-3"><History className="text-electric" size={21} /><div><h2 className="text-lg font-bold text-ink">Recent account records</h2><p className="text-sm text-slate-500">Latest promises and payments entered in this workspace.</p></div></div>
          {promises.length === 0 && paymentEvents.length === 0 ? <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No promises or incoming payments have been recorded yet.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {promises.slice(0, 6).map((promise) => <div key={promise.id} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4"><p className="text-xs font-bold uppercase text-violet-600">Payment promise</p><p className="mt-1 font-bold text-ink">{promise.customer.name} · {money(Number(promise.amount || 0))}</p><p className="mt-1 text-sm text-slate-500">{promise.invoice?.number || "Account level"} · due {promise.promisedFor.toLocaleDateString("en-GB")}</p></div>)}
            {paymentEvents.slice(0, 6).map((event) => { const details = (event.metadata || {}) as Record<string, unknown>; const customer = customers.find((item) => item.id === event.entityId); return <div key={event.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-xs font-bold uppercase text-emerald-600">Payment received</p><p className="mt-1 font-bold text-ink">{customer?.name || "Customer account"} · {money(Number(details.amount || 0))}</p><p className="mt-1 text-sm text-slate-500">{String(details.invoiceNumber || "Account level")} · {String(details.receivedOn || event.createdAt.toLocaleDateString("en-GB"))}</p></div>; })}
          </div>}
        </section>
      </div>
    </div>
  </main>;
}

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">{label}{children}</label>;
}

function Notice({ icon: Icon, text, colour }: { icon: typeof CheckCircle2; text: string; colour: "blue" | "emerald" }) {
  return <div className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold ${colour === "blue" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}><Icon size={19} />{text}</div>;
}

function money(amount: number) {
  return amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

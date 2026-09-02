import Link from "next/link";
import { AlertTriangle, ArrowLeft, Banknote, Check, CheckCircle2, ChevronDown, Circle, Clock3, FileText, Plus, Send, UploadCloud, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { confirmInvoiceLegalProtection, createInvoice, importInvoicesCsv, sendInvoice, updateInvoiceStatus } from "./actions";

export const dynamic = "force-dynamic";

const auditLabels: Record<string, string> = {
  REMINDER_GENERATED: "Reminder generated", REMINDER_EDITED: "Reminder edited", REMINDER_APPROVED: "Reminder approved",
  REMINDER_SENT: "Reminder sent", DELIVERY_CONFIRMED: "Delivery confirmed", EMAIL_OPENED: "Email opened",
  PAYMENT_PROMISE: "Payment promise", PROMISE_BROKEN: "Broken payment promise", PAYMENT_RECEIVED: "Payment received",
  STATEMENT_SENT: "Statement sent", DISPUTE_RAISED: "Dispute raised",
};

function auditValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return typeof value === "string" ? value : JSON.stringify(value);
}

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const [invoices, customers, auditEvents] = await Promise.all([
    prisma.invoice.findMany({ where: { companyId: user.companyId }, include: { customer: true }, orderBy: { dueDate: "asc" } }),
    prisma.customer.findMany({ where: { companyId: user.companyId }, orderBy: { name: "asc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Invoice" }, include: { user: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const params = await searchParams;
  const activeInvoices = invoices.filter(invoice => !["PAID", "WRITTEN_OFF"].includes(invoice.status));
  const openBalance = activeInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const overdueInvoices = invoices.filter(invoice => invoice.status === "OVERDUE");
  const overdueBalance = overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === "PAID");

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1">
    <header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Invoices</h1></header>
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>
      {params.legalConfirmed === "1" && <p className="mb-5 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Legal Protection confirmed. Reminders may now be sent for this invoice.</p>}
      {params.error === "legal-confirmation" && <p className="mb-5 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">Every Legal Protection confirmation must be checked.</p>}
      {params.error === "legal-email" && <p className="mb-5 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">Add and save the customer email address before confirming the recipient.</p>}
      {params.error === "legal-status" && <p className="mb-5 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">Legal Protection cannot be confirmed while this invoice is disputed, on hold or written off.</p>}
      <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#10285f] via-[#194b9f] to-[#2764ff] p-6 text-white shadow-[0_22px_55px_rgba(30,64,175,0.22)] sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Invoice portfolio</p><h2 className="mt-2 text-2xl font-bold">Your receivables at a glance</h2><p className="mt-2 text-sm text-blue-100">See what is open, overdue and paid before choosing the next action.</p></div><Link href="#add-invoice" className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-electric shadow-lg transition hover:-translate-y-0.5">Add invoice <Plus className="ml-2" size={17} /></Link></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InvoiceMetric icon={FileText} label="Invoices recorded" value={String(invoices.length)} />
          <InvoiceMetric icon={Banknote} label="Open balance" value={money(openBalance)} />
          <InvoiceMetric icon={AlertTriangle} label="Overdue balance" value={money(overdueBalance)} alert={overdueInvoices.length > 0} />
          <InvoiceMetric icon={CheckCircle2} label="Paid invoices" value={String(paidInvoices.length)} />
        </div>
      </section>

      <section className="mb-7 grid gap-5 lg:grid-cols-2">
        <article className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-card">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-electric text-white shadow-lg"><UploadCloud size={23} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-electric">Bulk action</p><h2 className="mt-1 text-xl font-bold text-ink">Import invoices from CSV</h2><p className="mt-2 text-sm leading-6 text-slate-600">Required: invoice number, customer name, amount and due date. Customer email is optional.</p></div></div>
          <form action={importInvoicesCsv} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><input name="file" type="file" accept=".csv,text/csv" required className="min-w-0 flex-1 rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm" /><button className="button-primary justify-center" type="submit">Import invoices</button></form>
          {params.imported && <p className="mt-3 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">Imported {params.imported} invoices successfully.</p>}
        </article>

        <article className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-6 shadow-card">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-700 text-white shadow-lg"><Send size={22} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Customer action</p><h2 className="mt-1 text-xl font-bold text-ink">Send an invoice</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose a recorded invoice and send it using the saved customer information.</p></div></div>
          <form action={sendInvoice} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="min-w-0 flex-1 text-sm font-semibold text-slate-700">Select invoice<select name="invoiceId" required className="mt-1.5 w-full rounded-xl border border-violet-100 bg-white px-3 py-3">{invoices.map(invoice => <option key={invoice.id} value={invoice.id}>{invoice.number} · {invoice.customer.name}</option>)}</select></label><button className="inline-flex items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-violet-800" type="submit">Send invoice <Send className="ml-2" size={16} /></button></form>
        </article>
      </section>
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_18px_45px_rgba(30,64,175,0.10)]"><div className="flex items-center justify-between border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/70 p-6"><div><h2 className="text-xl font-bold text-ink">Invoice register</h2><p className="mt-1 text-sm text-slate-500">{invoices.length} invoice{invoices.length === 1 ? "" : "s"} recorded.</p></div><FileText className="text-electric" size={20} /></div>
          {invoices.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No invoices yet.</p> : <div className="divide-y">{invoices.map(invoice => {
            const events = auditEvents.filter(event => event.entityId === invoice.id && event.action !== "NOTES_ADDED");
            const legalConfirmed = events.some(event => event.action === "LEGAL_PROTECTION_CONFIRMED");
            const completedActions = new Set(events.map(event => event.action).filter(action => action in auditLabels));
            if (invoice.status === "PAID") completedActions.add("PAYMENT_RECEIVED");
            if (invoice.status === "DISPUTED") completedActions.add("DISPUTE_RAISED");
            if (invoice.status === "PAYMENT_PLAN") completedActions.add("PAYMENT_PROMISE");
            if (["SENT", "OUTSTANDING", "OVERDUE", "PAID", "DISPUTED", "PAYMENT_PLAN"].includes(invoice.status)) completedActions.add("DELIVERY_CONFIRMED");
            return <article key={invoice.id} className="p-6 transition duration-300 hover:bg-blue-50/20"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold text-ink">{invoice.number} - {invoice.customer.name}</p><p className="mt-1 text-sm text-slate-500">Due {invoice.dueDate.toLocaleDateString("en-GB")}</p></div><div className="text-right"><p className="font-semibold text-ink">£{Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${invoice.status === "PAID" ? "bg-emerald-100 text-emerald-700" : invoice.status === "OVERDUE" ? "bg-rose-100 text-rose-700" : invoice.status === "DISPUTED" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"}`}>{invoice.status.toLowerCase().replaceAll("_", " ")}</span></div></div>
              <details className={`group mt-5 overflow-hidden rounded-2xl border shadow-sm ${legalConfirmed ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50/50"}`}><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-ink"><span className="flex items-center gap-2">Legal Protection {legalConfirmed && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] text-white">Confirmed</span>}</span><ChevronDown size={16} className="transition group-open:rotate-180" /></summary><div className="border-t bg-white p-4"><p className="text-sm leading-6 text-slate-600">Mandatory confirmation before any reminder can be sent. The recipient must use the email already saved on this customer account.</p>{invoice.customer.email ? <form action={confirmInvoiceLegalProtection} className="mt-4 space-y-3"><input type="hidden" name="invoiceId" value={invoice.id} /><LegalCheck name="invoiceCorrect" text="I confirm the invoice details, balance and due date are correct." /><LegalCheck name="goodsServicesSupplied" text="I confirm the goods or services were supplied as agreed." /><LegalCheck name="recipientCorrect" text={`I confirm ${invoice.customer.email} is the correct recipient and is already stored in CreditPilot.`} /><LegalCheck name="noDispute" text="I confirm no unresolved dispute, credit note or valid query exists." /><LegalCheck name="authorisedToContact" text="I confirm we are authorised to contact this customer regarding the outstanding balance." /><button className="button-primary mt-2" type="submit">{legalConfirmed ? "Renew confirmation" : "I confirm"}</button></form> : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">A stored customer email address is required before Legal Protection can be confirmed.</p>}</div></details>
              <details className="group mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-ink">Audit trail <span className="flex items-center gap-2 text-xs font-medium text-slate-500">{completedActions.size} of {Object.keys(auditLabels).length} complete<ChevronDown size={16} /></span></summary><div className="border-t bg-white p-4"><div className="mb-5 grid gap-2 sm:grid-cols-2">{Object.entries(auditLabels).map(([action, label]) => { const complete = completedActions.has(action); return <div key={action} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-400"}`}>{complete ? <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white"><Check size={13} /></span> : <Circle size={20} className="text-slate-300" />}{label}</div>})}</div>{events.length === 0 ? <p className="text-sm text-slate-500">Completed actions will appear here with their audit details.</p> : <div className="space-y-3">{events.map(event => { const metadata = (event.metadata || {}) as Record<string, unknown>; return <div key={event.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-emerald-700">{auditLabels[event.action] || event.action.replaceAll("_", " ").toLowerCase()}</p><time className="text-xs text-slate-500">{event.createdAt.toLocaleString("en-GB")}</time></div><details className="mt-2 rounded-lg bg-slate-50"><summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-600">Additional</summary><dl className="grid gap-2 border-t px-3 py-3 text-xs sm:grid-cols-2"><div><dt className="font-semibold">User</dt><dd>{event.user?.name || event.user?.email || String(metadata.submittedBy || "System")}</dd></div><div><dt className="font-semibold">Timestamp</dt><dd>{event.createdAt.toISOString()}</dd></div><div><dt className="font-semibold">IP address</dt><dd>{auditValue(metadata.ipAddress)}</dd></div><div><dt className="font-semibold">Previous value</dt><dd className="break-words">{auditValue(metadata.previousValue)}</dd></div><div className="sm:col-span-2"><dt className="font-semibold">New value</dt><dd className="break-words">{auditValue(metadata.newValue)}</dd></div></dl></details></div>})}</div>}</div></details>
              {invoice.status !== "PAID" && invoice.status !== "DISPUTED" && <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-slate-600">Report a dispute / put on hold</summary><form action={updateInvoiceStatus} className="mt-3 flex flex-wrap items-end gap-2"><input type="hidden" name="invoiceId" value={invoice.id} /><input type="hidden" name="status" value="DISPUTED" /><label className="min-w-64 flex-1 text-sm text-slate-600">Reason<input name="reason" required minLength={5} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><button className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white" type="submit">Mark disputed</button></form></details>}
            </article>})}</div>}
        </section>
        <section id="add-invoice" className="h-fit scroll-mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-6 shadow-[0_18px_45px_rgba(30,64,175,0.10)] xl:sticky xl:top-6"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-electric text-white"><Plus size={18} /></span><h2 className="font-bold text-ink">Add an invoice</h2></div>{customers.length === 0 ? <p className="mt-5 text-sm text-slate-500">Add a customer first.</p> : <form action={createInvoice} className="mt-5 space-y-4"><Field name="number" label="Invoice number" required /><Field name="amount" label="Amount (£)" type="number" required /><label className="block text-sm font-medium text-slate-700">Customer<select name="customerId" required className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5">{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><Field name="issueDate" label="Issue date" type="date" required /><Field name="dueDate" label="Due date" type="date" required /><button className="button-primary w-full" type="submit">Add invoice</button></form>}</section>
      </div>
    </div>
  </div></main>;
}

function InvoiceMetric({ icon: Icon, label, value, alert = false }: { icon: LucideIcon; label: string; value: string; alert?: boolean }) { return <div className={`rounded-2xl border p-4 backdrop-blur ${alert ? "border-rose-300/30 bg-rose-400/15" : "border-white/15 bg-white/10"}`}><div className="flex items-center gap-2 text-blue-100"><Icon size={16} /><p className="text-xs font-bold uppercase tracking-wide">{label}</p></div><p className={`mt-2 text-xl font-bold ${alert ? "text-rose-100" : "text-white"}`}>{value}</p></div>; }

function money(value: number) { return value.toLocaleString("en-GB", { style: "currency", currency: "GBP" }); }

function LegalCheck({ name, text }: { name: string; text: string }) { return <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"><input name={name} type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 text-electric focus:ring-electric" /><span>{text}</span></label>; }

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} required={required} className="mt-1.5 w-full rounded-lg border px-3 py-2.5" /></label>; }

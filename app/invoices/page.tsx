import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Circle, FileText, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { createInvoice, importInvoicesCsv, sendInvoice, updateInvoiceStatus } from "./actions";

export const dynamic = "force-dynamic";

const auditLabels: Record<string, string> = {
  REMINDER_GENERATED: "Reminder generated", REMINDER_EDITED: "Reminder edited", REMINDER_APPROVED: "Reminder approved",
  REMINDER_SENT: "Reminder sent", DELIVERY_CONFIRMED: "Delivery confirmed", EMAIL_OPENED: "Email opened",
  PAYMENT_PROMISE: "Payment promise", PROMISE_BROKEN: "Promise broken", PAYMENT_RECEIVED: "Payment received",
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

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1">
    <header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Invoices</h1></header>
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>
      <div className="mb-6 rounded-xl border border-blue-100 bg-sky p-5"><h2 className="font-bold text-ink">Import from CSV</h2><p className="mt-1 text-sm text-slate-600">Required columns: invoice_number, customer_name, amount, due_date. Optional: customer_email.</p><form action={importInvoicesCsv} className="mt-4 flex flex-wrap items-end gap-3"><input name="file" type="file" accept=".csv,text/csv" required className="rounded-lg border bg-white px-3 py-2 text-sm" /><button className="button-primary" type="submit">Import invoices</button></form>{params.imported && <p className="mt-3 text-sm font-semibold text-emerald-700">Imported {params.imported} invoices.</p>}</div>
      <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-card"><h2 className="font-bold text-ink">Send an invoice</h2><form action={sendInvoice} className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-64 flex-1 text-sm font-medium text-slate-700">Invoice<select name="invoiceId" required className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5">{invoices.map(invoice => <option key={invoice.id} value={invoice.id}>{invoice.number} · {invoice.customer.name}</option>)}</select></label><button className="button-primary" type="submit">Send invoice</button></form></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold text-ink">Invoice register</h2><p className="mt-1 text-sm text-slate-500">{invoices.length} invoice{invoices.length === 1 ? "" : "s"} recorded.</p></div><FileText className="text-electric" size={20} /></div>
          {invoices.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No invoices yet.</p> : <div className="divide-y">{invoices.map(invoice => {
            const events = auditEvents.filter(event => event.entityId === invoice.id && event.action !== "NOTES_ADDED");
            const completedActions = new Set(events.map(event => event.action).filter(action => action in auditLabels));
            if (invoice.status === "PAID") completedActions.add("PAYMENT_RECEIVED");
            if (invoice.status === "DISPUTED") completedActions.add("DISPUTE_RAISED");
            if (invoice.status === "PAYMENT_PLAN") completedActions.add("PAYMENT_PROMISE");
            if (["SENT", "OUTSTANDING", "OVERDUE", "PAID", "DISPUTED", "PAYMENT_PLAN"].includes(invoice.status)) completedActions.add("DELIVERY_CONFIRMED");
            return <article key={invoice.id} className="p-5"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold text-ink">{invoice.number} - {invoice.customer.name}</p><p className="mt-1 text-sm text-slate-500">Due {invoice.dueDate.toLocaleDateString("en-GB")}</p></div><div className="text-right"><p className="font-semibold text-ink">£{Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p><span className="text-xs font-semibold text-slate-600">{invoice.status.toLowerCase().replaceAll("_", " ")}</span></div></div>
              <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50"><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-ink">Audit trail <span className="flex items-center gap-2 text-xs font-medium text-slate-500">{completedActions.size} of {Object.keys(auditLabels).length} complete<ChevronDown size={16} /></span></summary><div className="border-t bg-white p-4"><div className="mb-5 grid gap-2 sm:grid-cols-2">{Object.entries(auditLabels).map(([action, label]) => { const complete = completedActions.has(action); return <div key={action} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-400"}`}>{complete ? <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white"><Check size={13} /></span> : <Circle size={20} className="text-slate-300" />}{label}</div>})}</div>{events.length === 0 ? <p className="text-sm text-slate-500">Completed actions will appear here with their audit details.</p> : <div className="space-y-3">{events.map(event => { const metadata = (event.metadata || {}) as Record<string, unknown>; return <div key={event.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-emerald-700">{auditLabels[event.action] || event.action.replaceAll("_", " ").toLowerCase()}</p><time className="text-xs text-slate-500">{event.createdAt.toLocaleString("en-GB")}</time></div><details className="mt-2 rounded-lg bg-slate-50"><summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-600">Additional</summary><dl className="grid gap-2 border-t px-3 py-3 text-xs sm:grid-cols-2"><div><dt className="font-semibold">User</dt><dd>{event.user?.name || event.user?.email || String(metadata.submittedBy || "System")}</dd></div><div><dt className="font-semibold">Timestamp</dt><dd>{event.createdAt.toISOString()}</dd></div><div><dt className="font-semibold">IP address</dt><dd>{auditValue(metadata.ipAddress)}</dd></div><div><dt className="font-semibold">Previous value</dt><dd className="break-words">{auditValue(metadata.previousValue)}</dd></div><div className="sm:col-span-2"><dt className="font-semibold">New value</dt><dd className="break-words">{auditValue(metadata.newValue)}</dd></div></dl></details></div>})}</div>}</div></details>
              {invoice.status !== "PAID" && invoice.status !== "DISPUTED" && <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-slate-600">Report a dispute / put on hold</summary><form action={updateInvoiceStatus} className="mt-3 flex flex-wrap items-end gap-2"><input type="hidden" name="invoiceId" value={invoice.id} /><input type="hidden" name="status" value="DISPUTED" /><label className="min-w-64 flex-1 text-sm text-slate-600">Reason<input name="reason" required minLength={5} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><button className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white" type="submit">Mark disputed</button></form></details>}
            </article>})}</div>}
        </section>
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-card"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-electric text-white"><Plus size={18} /></span><h2 className="font-bold text-ink">Add an invoice</h2></div>{customers.length === 0 ? <p className="mt-5 text-sm text-slate-500">Add a customer first.</p> : <form action={createInvoice} className="mt-5 space-y-4"><Field name="number" label="Invoice number" required /><Field name="amount" label="Amount (£)" type="number" required /><label className="block text-sm font-medium text-slate-700">Customer<select name="customerId" required className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5">{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><Field name="issueDate" label="Issue date" type="date" required /><Field name="dueDate" label="Due date" type="date" required /><button className="button-primary w-full" type="submit">Add invoice</button></form>}</section>
      </div>
    </div>
  </div></main>;
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} required={required} className="mt-1.5 w-full rounded-lg border px-3 py-2.5" /></label>; }

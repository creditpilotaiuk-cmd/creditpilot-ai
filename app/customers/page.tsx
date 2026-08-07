import Link from "next/link";
import { AlertTriangle, ArrowLeft, ChevronDown, Gauge, Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { createCustomer, refreshExternalRisk, updateCreditLimit } from "./actions";

export const dynamic = "force-dynamic";
function money(value: number) { return value.toLocaleString("en-GB", { style: "currency", currency: "GBP" }); }

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const [customers, creditLimitEvents, riskEvents] = await Promise.all([
    prisma.customer.findMany({ where: { companyId: user.companyId }, include: { invoices: true }, orderBy: { name: "asc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Customer", action: "CREDIT_LIMIT_SET" }, orderBy: { createdAt: "desc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Customer", action: "RISK_ASSESSMENT_UPDATED" }, orderBy: { createdAt: "desc" } }),
  ]);
  const params = await searchParams;

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Customers</h1></header><div className="mx-auto max-w-7xl p-5 sm:p-8"><Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} />Back to dashboard</Link>
    {params.creditLimit === "1" && <Notice text="Customer credit limit updated." />}{params.riskUpdated === "1" && <Notice text="Customer risk assessment refreshed." />}
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold text-ink">Your customers</h2><p className="mt-1 text-sm text-slate-500">{customers.length} customer{customers.length === 1 ? "" : "s"} in your workspace.</p></div><Users className="text-electric" size={20} /></div>{customers.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No customers yet.</p> : <div className="divide-y">{customers.map(customer => {
        const limitMetadata = (creditLimitEvents.find(event => event.entityId === customer.id)?.metadata || {}) as Record<string, unknown>;
        const creditLimit = Number(limitMetadata.newValue || 0);
        const riskEvent = riskEvents.find(event => event.entityId === customer.id);
        const riskMetadata = (riskEvent?.metadata || {}) as Record<string, unknown>;
        const externalRisk = (riskMetadata.newValue || {}) as Record<string, unknown>;
        const trustpilot = (externalRisk.trustpilot || {}) as Record<string, unknown>;
        const dnb = (externalRisk.dnb || {}) as Record<string, unknown>;
        const unavailable = Array.isArray(externalRisk.unavailable) ? externalRisk.unavailable as string[] : [];
        const openInvoices = customer.invoices.filter(invoice => !["PAID", "WRITTEN_OFF"].includes(invoice.status));
        const exposure = openInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
        const available = Math.max(0, creditLimit - exposure);
        const paidInvoices = customer.invoices.filter(invoice => invoice.status === "PAID" && invoice.paidAt);
        const averageDays = paidInvoices.length ? Math.round(paidInvoices.reduce((sum, invoice) => sum + Math.max(0, (invoice.paidAt!.getTime() - invoice.issueDate.getTime()) / 86400000), 0) / paidInvoices.length) : null;
        const averagePaidAmount = paidInvoices.length ? paidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0) / paidInvoices.length : 0;
        const riskFactor = customer.riskLevel === "HIGH" ? 0.6 : customer.riskLevel === "MEDIUM" ? 0.8 : 1;
        const suggestedLimit = Math.ceil(Math.max(1000, exposure * 1.25, averagePaidAmount * 3) * riskFactor / 100) * 100;
        const overdueCount = customer.invoices.filter(invoice => invoice.status === "OVERDUE").length;
        const overLimit = creditLimit > 0 && exposure > creditLimit;
        const internalRisk = `${customer.riskLevel.charAt(0)}${customer.riskLevel.slice(1).toLowerCase()} risk · internal data only`;
        return <article key={customer.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold text-ink">{customer.name}</p><p className="mt-1 text-sm text-slate-500">{customer.email ?? "No email added"}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{String(externalRisk.reliability || internalRisk)}</span></div>
          {(overLimit || overdueCount >= 4) && <div className="mt-4 space-y-2">{overLimit && <Warning text="Customer exceeds credit limit." />}{overdueCount >= 4 && <Warning text="Customer has 4 overdue invoices." />}</div>}
          <details className="mt-4 rounded-xl border bg-slate-50"><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-ink"><span className="flex items-center gap-2"><Gauge size={17} className="text-electric" />Functionality</span><ChevronDown size={16} className="text-slate-400" /></summary><div className="border-t bg-white p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Metric label="Credit Limit" value={creditLimit > 0 ? money(creditLimit) : "Not set"} /><Metric label="Current Exposure" value={money(exposure)} /><Metric label="Available Credit" value={creditLimit > 0 ? money(available) : "Not set"} /><Metric label="Average Days to Pay" value={averageDays === null ? "No payment history" : `${averageDays} days`} /><Metric label="Risk Rating" value={String(externalRisk.reliability || internalRisk)} /><Metric label="Suggested Credit Limit" value={money(suggestedLimit)} /></div>
            <div className="mt-5 rounded-lg border border-blue-100 bg-sky p-4"><h3 className="font-semibold text-ink">External company checks</h3>{riskEvent ? <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><strong>Trustpilot:</strong> {trustpilot.trustScore ? `${trustpilot.trustScore}/5 (${trustpilot.reviewCount || 0} reviews)` : "Unavailable"}</p><p><strong>D&amp;B:</strong> {dnb.rating ? `Rating ${dnb.rating}${dnb.financialCondition ? ` · ${dnb.financialCondition}` : ""}` : "Unavailable"}</p>{unavailable.length > 0 && <p className="sm:col-span-2 text-xs text-slate-500">{unavailable.join(" · ")}</p>}</div> : <p className="mt-2 text-sm text-slate-600">No external assessment has been run yet.</p>}<form action={refreshExternalRisk} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="customerId" value={customer.id} /><label className="text-sm font-medium text-slate-700">Company domain<input name="domain" defaultValue={String(externalRisk.domain || "")} placeholder="example.com" className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label><label className="text-sm font-medium text-slate-700">D-U-N-S number<input name="duns" defaultValue={String(externalRisk.duns || "")} placeholder="123456789" inputMode="numeric" className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label><button className="button-secondary sm:col-span-2" type="submit">Refresh external risk rating</button></form><p className="mt-3 text-xs text-slate-500">External information supports credit decisions but does not replace human review.</p></div>
            <form action={updateCreditLimit} className="mt-5 flex flex-wrap items-end gap-3 border-t pt-4"><input type="hidden" name="customerId" value={customer.id} /><label className="min-w-56 flex-1 text-sm font-medium text-slate-700">Set credit limit (£)<input name="creditLimit" type="number" min="0" step="0.01" defaultValue={creditLimit || ""} required className="mt-1 w-full rounded-lg border px-3 py-2" /></label><button className="button-secondary" type="submit">Save credit limit</button></form>
          </div></details>
        </article>})}</div>}</section>
      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-card"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-electric text-white"><Plus size={18} /></span><h2 className="font-bold text-ink">Add a customer</h2></div>{params.created === "1" && <Notice text="Customer added successfully." />}<form action={createCustomer} className="mt-5 space-y-4"><Field name="name" label="Customer name" placeholder="ABC Construction" required /><Field name="contactName" label="Contact name" placeholder="Alex Brown" /><Field name="email" label="Email address" placeholder="accounts@customer.co.uk" type="email" /><Field name="phone" label="Phone number" placeholder="020 1234 5678" /><button className="button-primary w-full" type="submit">Add customer</button></form></section>
    </div>
  </div></div></main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-100 bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold text-ink">{value}</p></div>; }
function Warning({ text }: { text: string }) { return <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"><AlertTriangle size={16} />{text}</div>; }
function Notice({ text }: { text: string }) { return <p className="mb-5 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{text}</p>; }
function Field({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-1.5 w-full rounded-lg border px-3 py-2.5" /></label>; }

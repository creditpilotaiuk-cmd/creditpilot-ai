import Link from "next/link";
import { AlertTriangle, ArrowLeft, ChevronDown, Download, Gauge, Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { createCustomer, refreshExternalRisk, updateCreditLimit, updateDunningControl } from "./actions";

export const dynamic = "force-dynamic";
function money(value: number) { return value.toLocaleString("en-GB", { style: "currency", currency: "GBP" }); }

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const premiumExternalChecks = ["GROWTH", "PROFESSIONAL"].includes(user.company.plan.toUpperCase());
  const premiumPaymentInsights = ["GROWTH", "PROFESSIONAL"].includes(user.company.plan.toUpperCase());
  const sixMonthsAgo = new Date(Date.now() - 183 * 86400000);
  const [customers, creditLimitEvents, riskEvents, dunningEvents] = await Promise.all([
    prisma.customer.findMany({ where: { companyId: user.companyId }, include: { invoices: { include: { reminders: true } }, paymentPromises: true }, orderBy: { name: "asc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Customer", action: "CREDIT_LIMIT_SET" }, orderBy: { createdAt: "desc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Customer", action: "RISK_ASSESSMENT_UPDATED" }, orderBy: { createdAt: "desc" } }),
    prisma.auditEvent.findMany({ where: { companyId: user.companyId, entity: "Customer", action: "DUNNING_CONTROL_UPDATED" }, orderBy: { createdAt: "desc" } }),
  ]);
  const params = await searchParams;

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Customers</h1></header><div className="mx-auto max-w-7xl p-5 sm:p-8"><Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} />Back to dashboard</Link>
    {params.creditLimit === "1" && <Notice text="Customer credit limit updated." />}{params.riskUpdated === "1" && <Notice text="Customer risk assessment refreshed." />}{params.dunning === "paused" && <Notice text="Reminders and dunning letters paused for this account." />}{params.dunning === "resumed" && <Notice text="Reminders and dunning letters resumed for this account." />}{params.error === "premium-risk" && <Warning text="External Company Checks are available on Growth and Professional plans." />}{params.error === "dunning-reason" && <Warning text="Add a reason of at least 5 characters before marking an account uncollectable." />}
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold text-ink">Your customers</h2><p className="mt-1 text-sm text-slate-500">{customers.length} customer{customers.length === 1 ? "" : "s"} in your workspace.</p></div><Users className="text-electric" size={20} /></div>{customers.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No customers yet.</p> : <div className="divide-y">{customers.map(customer => {
        const limitMetadata = (creditLimitEvents.find(event => event.entityId === customer.id)?.metadata || {}) as Record<string, unknown>;
        const creditLimit = Number(limitMetadata.newValue || 0);
        const riskEvent = riskEvents.find(event => event.entityId === customer.id);
        const riskMetadata = (riskEvent?.metadata || {}) as Record<string, unknown>;
        const externalRisk = (riskMetadata.newValue || {}) as Record<string, unknown>;
        const dunningEvent = dunningEvents.find(event => event.entityId === customer.id);
        const dunningMetadata = (dunningEvent?.metadata || {}) as Record<string, unknown>;
        const dunningValue = (dunningMetadata.newValue || {}) as Record<string, unknown>;
        const dunningPaused = dunningValue.paused === true;
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
        const brokenPromises = customer.paymentPromises.filter(promise => promise.status === "BROKEN" && promise.updatedAt >= sixMonthsAgo).length;
        const paidAfterSecondReminder = paidInvoices.filter(invoice => invoice.reminders.some(reminder => reminder.stage >= 2 && reminder.status === "SENT")).length;
        const secondReminderPattern = paidInvoices.length >= 3 && paidAfterSecondReminder / paidInvoices.length >= 0.6;
        const paymentDelays = paidInvoices
          .map(invoice => Math.max(0, Math.round((invoice.paidAt!.getTime() - invoice.dueDate.getTime()) / 86400000)))
          .sort((a, b) => b - a);
        const recentDelay = paymentDelays.length >= 3 ? paymentDelays.slice(0, 3).reduce((sum, days) => sum + days, 0) / 3 : 0;
        const previousDelay = paymentDelays.length >= 6 ? paymentDelays.slice(3, 6).reduce((sum, days) => sum + days, 0) / 3 : 0;
        const suddenChange = paymentDelays.length >= 6 && recentDelay >= previousDelay + 7;
        const paymentRecommendations = [
          ...(brokenPromises >= 3 ? [{ title: "Repeated broken payment promises", message: `This customer has broken ${brokenPromises} payment promises in the past six months. Consider pausing further payment-plan offers and requesting payment in full.`, tone: "rose" }] : []),
          ...(secondReminderPattern ? [{ title: "Predictable payment pattern", message: "This customer typically pays after the second reminder. Consider delaying escalation until the usual payment window has passed.", tone: "blue" }] : []),
          ...(suddenChange ? [{ title: "Sudden change in payment behaviour", message: "This customer’s payment behaviour has changed unexpectedly. This may indicate financial distress; review the account before extending further credit.", tone: "amber" }] : []),
        ];
        return <article key={customer.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold text-ink">{customer.name}</p><p className="mt-1 text-sm text-slate-500">{customer.email ?? "No email added"}</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{String(externalRisk.reliability || internalRisk)}</span><a href={`/api/customers/${customer.id}/collection-pack`} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-electric hover:bg-sky"><Download size={15} />Export collection pack</a></div></div>
          {(overLimit || overdueCount >= 4) && <div className="mt-4 space-y-2">{overLimit && <Warning text="Customer exceeds credit limit." />}{overdueCount >= 4 && <Warning text="Customer has 4 overdue invoices." />}</div>}
          <details className="mt-4 rounded-xl border bg-slate-50"><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-ink"><span className="flex items-center gap-2"><Gauge size={17} className="text-electric" />Functionality</span><ChevronDown size={16} className="text-slate-400" /></summary><div className="border-t bg-white p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Metric label="Credit Limit" value={creditLimit > 0 ? money(creditLimit) : "Not set"} /><Metric label="Current Exposure" value={money(exposure)} /><Metric label="Available Credit" value={creditLimit > 0 ? money(available) : "Not set"} /><Metric label="Average Days to Pay" value={averageDays === null ? "No payment history" : `${averageDays} days`} /><Metric label="Risk Rating" value={String(externalRisk.reliability || internalRisk)} /><Metric label="Suggested Credit Limit" value={money(suggestedLimit)} /></div>
            <div className="mt-5 rounded-lg border border-violet-200 bg-violet-50/40 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-ink">Payment behaviour recommendations</h3><p className="mt-1 text-xs text-slate-500">Account-specific guidance based on recorded payment history.</p></div><span className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">Premium insight</span></div>{premiumPaymentInsights ? paymentRecommendations.length > 0 ? <div className="mt-4 space-y-3">{paymentRecommendations.map(recommendation => <div key={recommendation.title} className={`rounded-lg border bg-white p-3 ${recommendation.tone === "rose" ? "border-rose-200" : recommendation.tone === "amber" ? "border-amber-200" : "border-blue-200"}`}><p className="text-sm font-semibold text-ink">{recommendation.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{recommendation.message}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-600">No recommendation is available yet. Insights appear once the account has sufficient payment-history evidence.</p> : <div className="mt-3 rounded-lg bg-white p-4"><p className="text-sm font-semibold text-slate-700">Available with Growth and Professional subscriptions.</p><p className="mt-1 text-xs text-slate-500">Upgrade to unlock account-level payment behaviour recommendations.</p><Link href="/pricing" className="mt-3 inline-flex text-sm font-semibold text-electric">View membership options →</Link></div>}</div>
            <div className="mt-5 rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-ink">External company checks</h3><span className="rounded-full bg-electric px-2.5 py-1 text-xs font-semibold text-white">Premium</span></div>{premiumExternalChecks ? <>{riskEvent && externalRisk.summary ? <p className="mt-3 rounded-lg bg-sky p-3 text-sm leading-6 text-slate-700">{String(externalRisk.summary)}</p> : <p className="mt-2 text-sm text-slate-600">Enter the company domain to retrieve a Creditsafe risk summary.</p>}<form action={refreshExternalRisk} className="mt-4 flex flex-wrap items-end gap-3"><input type="hidden" name="customerId" value={customer.id} /><label className="min-w-64 flex-1 text-sm font-medium text-slate-700">Company domain<input name="domain" required defaultValue={String(externalRisk.domain || "")} placeholder="example.com" className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label><button className="button-secondary" type="submit">Refresh external risk rating</button></form></> : <div className="mt-3 rounded-lg bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-700">Available with Growth and Professional subscriptions.</p><p className="mt-1 text-xs text-slate-500">Upgrade to retrieve a Creditsafe risk summary.</p><Link href="/pricing" className="mt-3 inline-flex text-sm font-semibold text-electric">View membership options →</Link></div>}</div>
            <form action={updateCreditLimit} className="mt-5 flex flex-wrap items-end gap-3 border-t pt-4"><input type="hidden" name="customerId" value={customer.id} /><label className="min-w-56 flex-1 text-sm font-medium text-slate-700">Set credit limit (£)<input name="creditLimit" type="number" min="0" step="0.01" defaultValue={creditLimit || ""} required className="mt-1 w-full rounded-lg border px-3 py-2" /></label><button className="button-secondary" type="submit">Save credit limit</button></form>
            <div className={`mt-5 rounded-lg border p-4 ${dunningPaused ? "border-amber-200 bg-amber-50" : "border-slate-200"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-ink">Dunning letters</h3><p className="mt-1 text-sm text-slate-600">Pause all reminders and dunning letters while this customer account is uncollectable.</p>{dunningPaused && <p className="mt-2 text-sm font-semibold text-amber-800">Paused: {String(dunningValue.reason || "Account marked uncollectable")}</p>}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dunningPaused ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-700"}`}>{dunningPaused ? "Paused" : "Active"}</span></div><form action={updateDunningControl} className="mt-4 flex flex-wrap items-end gap-3"><input type="hidden" name="customerId" value={customer.id} /><input type="hidden" name="paused" value={dunningPaused ? "false" : "true"} />{!dunningPaused && <label className="min-w-64 flex-1 text-sm font-medium text-slate-700">Reason account is uncollectable<input name="reason" required minLength={5} placeholder="For example: insolvency or temporary hold" className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label>}<button className={dunningPaused ? "button-primary" : "button-secondary"} type="submit">{dunningPaused ? "Resume reminders" : "Pause reminders and dunning"}</button></form></div>
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

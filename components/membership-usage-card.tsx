import Link from "next/link";
import { ArrowRight, CheckCircle2, Gauge, Sparkles, TriangleAlert } from "lucide-react";

const limits = {
  STARTER: 150,
  GROWTH: 750,
  PROFESSIONAL: 2500,
} as const;

type PaidPlan = keyof typeof limits;

function asPaidPlan(plan: string): PaidPlan | null {
  const normalized = plan.toUpperCase();
  return normalized in limits ? normalized as PaidPlan : null;
}

export function MembershipUsageCard({ plan, activeInvoices }: { plan: string; activeInvoices: number }) {
  const paidPlan = asPaidPlan(plan);

  if (!paidPlan) {
    return <section className="mt-6 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-xl shadow-slate-200/60">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><Sparkles size={20} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Membership & usage</p>
            <h3 className="mt-1 text-xl font-bold text-ink">You&apos;re using the Founding Beta</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">You currently have {activeInvoices} active invoice{activeInvoices === 1 ? "" : "s"}. All available beta features are free, and we&apos;ll show clear usage guidance before any membership change is needed.</p>
          </div>
        </div>
        <Link href="/pricing" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-electric transition hover:border-blue-300 hover:bg-blue-50">Explore memberships <ArrowRight className="ml-2" size={16} /></Link>
      </div>
    </section>;
  }

  const limit = limits[paidPlan];
  const usage = Math.round((activeInvoices / limit) * 100);
  const atCapacity = activeInvoices >= limit;
  const nearingCapacity = !atCapacity && usage >= 80;
  const nextPlan = paidPlan === "STARTER" ? "Growth" : paidPlan === "GROWTH" ? "Professional" : null;
  const title = atCapacity ? "You’ve reached your included invoice capacity" : nearingCapacity ? "You’re approaching your invoice capacity" : "Your included capacity is on track";
  const copy = atCapacity
    ? "Choose extra invoice capacity if your team only needs more room, or move up a membership if you also need the next level of features."
    : nearingCapacity
      ? "Plan ahead: add invoice capacity for a small increase, or upgrade if the next membership better fits your team."
      : "We’ll alert you here before you run out of included invoice capacity.";
  const Icon = atCapacity || nearingCapacity ? TriangleAlert : CheckCircle2;
  const iconStyle = atCapacity ? "bg-rose-100 text-rose-700" : nearingCapacity ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
  const barStyle = atCapacity ? "bg-rose-500" : nearingCapacity ? "bg-amber-500" : "bg-emerald-500";

  return <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="flex items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${iconStyle}`}><Icon size={20} /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Membership & usage</p>
          <h3 className="mt-1 text-xl font-bold text-ink">{paidPlan[0]}{paidPlan.slice(1).toLowerCase()} membership</h3>
          <p className="mt-1 text-sm text-slate-500">{activeInvoices.toLocaleString("en-GB")} of {limit.toLocaleString("en-GB")} active invoices included</p>
        </div>
      </div>
      <Link href="/pricing" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-electric transition hover:border-blue-300 hover:bg-blue-50">Manage membership <ArrowRight className="ml-2" size={16} /></Link>
    </div>
    <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-4 text-sm"><span className="flex items-center gap-2 font-semibold text-ink"><Gauge size={16} className="text-electric" />Invoice usage</span><span className="font-bold text-slate-600">{Math.min(usage, 100)}%</span></div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${barStyle}`} style={{ width: `${Math.min(usage, 100)}%` }} /></div>
      <div className={`mt-5 rounded-2xl p-4 ${atCapacity ? "bg-rose-50" : nearingCapacity ? "bg-amber-50" : "bg-emerald-50"}`}><p className="font-bold text-ink">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p></div>
      {(atCapacity || nearingCapacity) && <div className="mt-4 flex flex-wrap gap-3"><Link href="/pricing#add-ons" className="inline-flex items-center rounded-xl bg-electric px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">View invoice add-ons <ArrowRight className="ml-2" size={16} /></Link>{nextPlan ? <Link href={`/pricing#${nextPlan.toLowerCase()}`} className="inline-flex items-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-electric transition hover:bg-blue-50">Consider {nextPlan} <ArrowRight className="ml-2" size={16} /></Link> : null}</div>}
    </div>
  </section>;
}

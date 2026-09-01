import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requestCancellation } from "./actions";

export const dynamic = "force-dynamic";

const plans = [
  {
    name: "Starter",
    price: "£49",
    strapline: "Essential credit control",
    description: "For small businesses building a reliable, organised collection process.",
    limit: "150 active invoices",
    features: [
      "Prioritised chase list and Priority Score",
      "Customer and invoice management with CSV import",
      "Three-stage editable reminders with human approval",
      "Statements, payment promises and missed-promise identification",
      "Basic disputes, chase holds and collection timeline",
      "Invoice ageing, audit trail and workspace export",
      "Legal-protection checklist and core email support",
    ],
  },
  {
    name: "Growth",
    price: "£129",
    strapline: "Intelligent credit control",
    description: "For established SMEs managing a busier debtor book and more detailed follow-up.",
    limit: "750 active invoices",
    featured: true,
    features: [
      "Everything in Starter",
      "Copilot action plans and workspace questions",
      "AI-assisted reply analysis and suggested wording",
      "Smart timing, next actions and behaviour recommendations",
      "Broken-promise monitoring and alerts",
      "Advanced disputes, chase holds and case ownership",
      "Complete customer timeline and enhanced analytics",
      "Suggested credit limits and risk-check readiness",
    ],
  },
  {
    name: "Professional",
    price: "£249",
    strapline: "Complete oversight and evidence",
    description: "For finance teams needing deeper history, evidence and escalation support.",
    limit: "2,500 active invoices",
    features: [
      "Everything in Growth",
      "Complete invoice and customer collection histories",
      "Detailed reminder, promise, dispute and hold history",
      "Decision history and complete audit trail",
      "Approval, sending and email-delivery evidence",
      "Legal-protection status and escalation evidence",
      "Downloadable collection and evidence packs",
      "Premium insights and higher-volume analytics",
    ],
  },
];

const premiumAddOns = [
  {
    name: "Extra 250 invoices",
    price: "£25",
    term: "/ month",
    description: "Add capacity without moving to the next membership.",
    wide: false,
  },
  {
    name: "Extra 1,000 invoices",
    price: "£65",
    term: "/ month",
    description: "A larger capacity boost for expanding debtor books.",
    wide: false,
  },
  {
    name: "Additional Growth user",
    price: "£12",
    term: "/ user / month",
    description: "Give another team member access to your Growth workspace.",
    wide: false,
  },
  {
    name: "Additional Professional user",
    price: "£18",
    term: "/ user / month",
    description: "Add a user where advanced team controls apply.",
    wide: false,
  },
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const params = await searchParams;
  return (
    <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Account and billing</p><h1 className="text-xl font-bold text-ink">Membership</h1></header>
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        {params.success && <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Checkout complete. Your account will update once payment is confirmed.</p>}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 shadow-card sm:p-9"><p className="eyebrow">Founding beta · £0</p><h2 className="mt-3 text-3xl font-bold text-ink">Every current feature, free throughout the beta</h2><p className="mt-4 max-w-3xl leading-7 text-slate-600">There is no subscription charge, card, contract or automatic paid conversion. We will give you advance notice before billing begins, and you must actively select a membership to continue.</p><div className="mt-6 rounded-xl border border-violet-100 bg-white p-5"><p className="text-sm font-bold text-violet-700">Founding-customer benefit</p><p className="mt-2 text-sm leading-6 text-slate-600">Choose Starter or Growth after the beta and receive the next membership level&apos;s features for your first six months while paying your chosen plan&apos;s price. After six months, access automatically returns to the selected plan unless you actively choose to upgrade. Professional customers remain on Professional.</p></div></section>
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">After the beta</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">Choose the control your business needs</h2>
              <p className="mt-3 leading-7 text-slate-600">Three clear memberships, with room to add capacity as your debtor book grows.</p>
            </div>
            <p className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-slate-600">Planned prices · VAT position to be confirmed</p>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {plans.map(plan => (
              <article key={plan.name} className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-card transition-transform hover:-translate-y-1 ${plan.featured ? "border-electric ring-2 ring-electric/10" : "border-slate-200"}`}>
                {plan.featured && <div className="absolute right-0 top-0 rounded-bl-2xl bg-electric px-4 py-2 text-xs font-bold text-white">Most popular</div>}
                <div className={`mb-5 h-1.5 w-14 rounded-full ${plan.featured ? "bg-electric" : "bg-slate-300"}`} />
                <h3 className="text-2xl font-bold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm font-semibold text-electric">{plan.strapline}</p>
                <div className="mt-5 flex items-end gap-2">
                  <p className="text-4xl font-bold text-ink">{plan.price}</p>
                  <span className="pb-1 text-sm font-medium text-slate-500">/ month</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
                <p className="mt-5 inline-flex w-fit rounded-full bg-sky px-4 py-2 text-sm font-bold text-ink">{plan.limit}</p>
                <div className="my-5 border-t border-slate-100" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Key benefits</p>
                <ul className="mt-4 flex-1 space-y-3 text-sm leading-5 text-slate-700">
                  {plan.features.map(feature => <li key={feature} className="flex gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">✓</span><span>{feature}</span></li>)}
                </ul>
                <button type="button" disabled className={`mt-7 w-full cursor-not-allowed rounded-xl px-4 py-3 text-sm font-bold ${plan.featured ? "bg-electric text-white opacity-70" : "border border-slate-200 bg-slate-50 text-slate-500"}`}>Available after beta</button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-card sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Premium add-ons</p>
              <h2 className="mt-2 text-2xl font-bold">Add capacity without changing your plan</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">Choose only what your business needs. Monthly add-ons can grow with you, while onboarding support is charged once.</p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {premiumAddOns.map(addOn => (
                <article key={addOn.name} className={`rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur ${addOn.wide ? "sm:col-span-2 xl:col-span-4" : ""}`}>
                  <div className={addOn.wide ? "sm:flex sm:items-center sm:justify-between sm:gap-8" : ""}>
                    <div>
                      <p className="text-sm font-bold text-white">{addOn.name}</p>
                      <p className="mt-3 text-3xl font-bold">{addOn.price}<span className="ml-2 text-xs font-semibold text-blue-200">{addOn.term}</span></p>
                    </div>
                    <p className={`mt-3 text-sm leading-6 text-blue-100 ${addOn.wide ? "sm:mt-0 sm:max-w-2xl" : ""}`}>{addOn.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200/30 bg-amber-100/10 px-5 py-4">
              <p className="text-sm font-bold text-amber-100">Company-risk checks</p>
              <p className="mt-1 text-xs leading-5 text-blue-100">Creditsafe pricing will be added only after supplier costs, API access and data rights are confirmed. It will not be advertised as unlimited.</p>
            </div>
          </div>
        </section>
        <section className="mt-8 rounded-xl border border-rose-100 bg-rose-50 p-6"><h3 className="font-bold text-ink">Need to cancel?</h3><p className="mt-2 max-w-2xl text-sm text-slate-600">Your data is not deleted immediately. Submit a request and we&apos;ll confirm the cancellation.</p><form action={requestCancellation} className="mt-4"><button className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700" type="submit">Request cancellation</button></form></section>
      </div>
    </div></main>
  );
}import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requestCancellation } from "./actions";

export const dynamic = "force-dynamic";

const plans = [
  {
    name: "Starter",
    price: "£49",
    strapline: "Essential credit control",
    description: "For small businesses building a reliable, organised collection process.",
    limit: "150 active invoices",
    features: [
      "Prioritised chase list and Priority Score",
      "Customer and invoice management with CSV import",
      "Three-stage editable reminders with human approval",
      "Statements, payment promises and missed-promise identification",
      "Basic disputes, chase holds and collection timeline",
      "Invoice ageing, audit trail and workspace export",
      "Legal-protection checklist and core email support",
    ],
  },
  {
    name: "Growth",
    price: "£129",
    strapline: "Intelligent credit control",
    description: "For established SMEs managing a busier debtor book and more detailed follow-up.",
    limit: "750 active invoices",
    featured: true,
    features: [
      "Everything in Starter",
      "Copilot action plans and workspace questions",
      "AI-assisted reply analysis and suggested wording",
      "Smart timing, next actions and behaviour recommendations",
      "Broken-promise monitoring and alerts",
      "Advanced disputes, chase holds and case ownership",
      "Complete customer timeline and enhanced analytics",
      "Suggested credit limits and risk-check readiness",
    ],
  },
  {
    name: "Professional",
    price: "£249",
    strapline: "Complete oversight and evidence",
    description: "For finance teams needing deeper history, evidence and escalation support.",
    limit: "2,500 active invoices",
    features: [
      "Everything in Growth",
      "Complete invoice and customer collection histories",
      "Detailed reminder, promise, dispute and hold history",
      "Decision history and complete audit trail",
      "Approval, sending and email-delivery evidence",
      "Legal-protection status and escalation evidence",
      "Downloadable collection and evidence packs",
      "Premium insights and higher-volume analytics",
    ],
  },
];

const premiumAddOns = [
  {
    name: "Extra 250 invoices",
    price: "£25",
    term: "/ month",
    description: "Add capacity without moving to the next membership.",
  },
  {
    name: "Extra 1,000 invoices",
    price: "£65",
    term: "/ month",
    description: "A larger capacity boost for expanding debtor books.",
  },
  {
    name: "Additional Growth user",
    price: "£12",
    term: "/ user / month",
    description: "Give another team member access to your Growth workspace.",
  },
  {
    name: "Additional Professional user",
    price: "£18",
    term: "/ user / month",
    description: "Add a user where advanced team controls apply.",
  },
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const params = await searchParams;
  return (
    <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Account and billing</p><h1 className="text-xl font-bold text-ink">Membership</h1></header>
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        {params.success && <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Checkout complete. Your account will update once payment is confirmed.</p>}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 shadow-card sm:p-9"><p className="eyebrow">Founding beta · £0</p><h2 className="mt-3 text-3xl font-bold text-ink">Every current feature, free throughout the beta</h2><p className="mt-4 max-w-3xl leading-7 text-slate-600">There is no subscription charge, card, contract or automatic paid conversion. We will give you advance notice before billing begins, and you must actively select a membership to continue.</p><div className="mt-6 rounded-xl border border-violet-100 bg-white p-5"><p className="text-sm font-bold text-violet-700">Founding-customer benefit</p><p className="mt-2 text-sm leading-6 text-slate-600">Choose Starter or Growth after the beta and receive the next membership level&apos;s features for your first six months while paying your chosen plan&apos;s price. After six months, access automatically returns to the selected plan unless you actively choose to upgrade. Professional customers remain on Professional.</p></div></section>
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">After the beta</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">Choose the control your business needs</h2>
              <p className="mt-3 leading-7 text-slate-600">Three clear memberships, with room to add capacity as your debtor book grows.</p>
            </div>
            <p className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-slate-600">Planned prices · VAT position to be confirmed</p>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {plans.map(plan => (
              <article key={plan.name} className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-card transition-transform hover:-translate-y-1 ${plan.featured ? "border-electric ring-2 ring-electric/10" : "border-slate-200"}`}>
                {plan.featured && <div className="absolute right-0 top-0 rounded-bl-2xl bg-electric px-4 py-2 text-xs font-bold text-white">Most popular</div>}
                <div className={`mb-5 h-1.5 w-14 rounded-full ${plan.featured ? "bg-electric" : "bg-slate-300"}`} />
                <h3 className="text-2xl font-bold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm font-semibold text-electric">{plan.strapline}</p>
                <div className="mt-5 flex items-end gap-2">
                  <p className="text-4xl font-bold text-ink">{plan.price}</p>
                  <span className="pb-1 text-sm font-medium text-slate-500">/ month</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
                <p className="mt-5 inline-flex w-fit rounded-full bg-sky px-4 py-2 text-sm font-bold text-ink">{plan.limit}</p>
                <div className="my-5 border-t border-slate-100" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Key benefits</p>
                <ul className="mt-4 flex-1 space-y-3 text-sm leading-5 text-slate-700">
                  {plan.features.map(feature => <li key={feature} className="flex gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">✓</span><span>{feature}</span></li>)}
                </ul>
                <button type="button" disabled className={`mt-7 w-full cursor-not-allowed rounded-xl px-4 py-3 text-sm font-bold ${plan.featured ? "bg-electric text-white opacity-70" : "border border-slate-200 bg-slate-50 text-slate-500"}`}>Available after beta</button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-card sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Premium add-ons</p>
              <h2 className="mt-2 text-2xl font-bold">Add capacity without changing your plan</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">Choose only what your business needs. Monthly add-ons can grow with you, while onboarding support is charged once.</p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {premiumAddOns.map(addOn => (
                <article key={addOn.name} className={`rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur ${addOn.wide ? "sm:col-span-2 xl:col-span-4" : ""}`}>
                  <div className={addOn.wide ? "sm:flex sm:items-center sm:justify-between sm:gap-8" : ""}>
                    <div>
                      <p className="text-sm font-bold text-white">{addOn.name}</p>
                      <p className="mt-3 text-3xl font-bold">{addOn.price}<span className="ml-2 text-xs font-semibold text-blue-200">{addOn.term}</span></p>
                    </div>
                    <p className={`mt-3 text-sm leading-6 text-blue-100 ${addOn.wide ? "sm:mt-0 sm:max-w-2xl" : ""}`}>{addOn.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200/30 bg-amber-100/10 px-5 py-4">
              <p className="text-sm font-bold text-amber-100">Company-risk checks</p>
              <p className="mt-1 text-xs leading-5 text-blue-100">Creditsafe pricing will be added only after supplier costs, API access and data rights are confirmed. It will not be advertised as unlimited.</p>
            </div>
          </div>
        </section>
        <section className="mt-8 rounded-xl border border-rose-100 bg-rose-50 p-6"><h3 className="font-bold text-ink">Need to cancel?</h3><p className="mt-2 max-w-2xl text-sm text-slate-600">Your data is not deleted immediately. Submit a request and we&apos;ll confirm the cancellation.</p><form action={requestCancellation} className="mt-4"><button className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700" type="submit">Request cancellation</button></form></section>
      </div>
    </div></main>
  );
}

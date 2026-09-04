import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, Layers3, Sparkles, Star, Zap } from "lucide-react";
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
    strapline: "Essential credit control for small businesses",
    description: "Designed for small businesses that need a consistent and organised collection process.",
    limit: "150 active invoices",
    bestFor: "Small businesses establishing a reliable and consistent credit-control process.",
    features: [
      "Up to 150 active invoices", "Credit-control overview dashboard", "Today’s prioritised chase list", "Explainable CreditPilot Priority Score",
      "Customer management", "Invoice management", "CSV invoice import", "Three-stage reminder workflow", "Editable reminder drafts",
      "Human approval before reminders are sent", "Customer statements", "Record invoices as paid", "Record payment promises",
      "Identify missed payment promises", "Basic dispute and chase-hold controls", "Customer collection timeline", "Basic invoice audit trail",
      "Legal-protection confirmation checklist", "Invoice-ageing overview", "Bank-transfer payment instructions", "Workspace data export", "Core email support",
    ],
  },
  {
    name: "Growth",
    price: "£129",
    strapline: "Intelligent credit control for growing businesses",
    description: "Designed for established SMEs managing a larger debtor book and more complex collection cases.",
    limit: "750 active invoices",
    bestFor: "Growing businesses with regular credit-control activity, a busier debtor book and customers requiring more detailed follow-up.",
    featured: true,
    features: [
      "Everything included in Starter", "Up to 750 active invoices", "Copilot action plans",
      "Ask Copilot questions about invoices, customers, payments and reminders", "AI-assisted customer-reply analysis",
      "Suggested customer-response wording", "Smart reminder timing based on recorded payment patterns",
      "Customer payment-behaviour recommendations", "Suggested customer credit limits", "Broken-promise monitoring and alerts",
      "Recommended follow-up actions", "Advanced dispute controls", "Pause chase communications with a recorded reason",
      "Case ownership and workflow controls", "Complete customer collection timeline", "Enhanced collection analytics",
      "Promise-kept rate", "Payment-rate reporting", "Largest outstanding balance reporting",
      "External company-risk checks through Creditsafe once configured",
    ],
  },
  {
    name: "Professional",
    price: "£249",
    strapline: "Complete oversight and evidence for larger teams",
    description: "Designed for larger finance teams requiring deeper collection history, audit evidence and escalation support.",
    limit: "2,500 active invoices",
    bestFor: "Larger finance teams, credit-control departments and businesses requiring documented evidence before escalation.",
    features: [
      "Everything included in Growth", "Up to 2,500 active invoices", "Complete invoice collection history",
      "Complete customer collection history", "Detailed reminder history", "Payment-promise and broken-promise history",
      "Dispute and chase-hold history", "Case-ownership decision history", "Complete invoice audit trail",
      "Communication approval and sending records", "Email-delivery evidence", "Legal-protection status",
      "Downloadable customer collection packs", "Evidence-pack exports", "Deeper escalation evidence",
      "Premium customer-risk insights", "Premium payment-behaviour insights", "Higher-volume collection analytics",
      "Higher-volume collection management",
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
    <main className="flex min-h-screen">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <header className="border-b bg-white px-5 py-4 sm:px-8">
          <p className="text-sm text-slate-500">Account and billing</p>
          <h1 className="text-xl font-bold text-ink">Membership</h1>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          {params.success && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={19} />Checkout complete. Your account will update once payment is confirmed.</div>}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-2xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><Sparkles size={14} />Founding beta · £0</span>
                <h2 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Every current feature, free throughout the beta.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-blue-100">No subscription charge, payment card, contract or automatic paid conversion. We will give you advance notice before billing begins, and you will actively choose whether to continue.</p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/10 px-3 py-2">No card required</span>
                  <span className="rounded-full bg-white/10 px-3 py-2">No contract</span>
                  <span className="rounded-full bg-white/10 px-3 py-2">No automatic conversion</span>
                </div>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-400/20 text-violet-200"><Star size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-200">Founding-customer benefit</p><p className="mt-1 font-bold">Six-month feature upgrade</p></div></div>
                <p className="mt-4 text-sm leading-6 text-blue-100">Choose Starter or Growth after beta and receive the next membership level’s features for your first six months while paying your chosen plan’s price. Professional remains Professional.</p>
              </div>
            </div>
          </section>

          <nav aria-label="Membership sections" className="sticky top-0 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-slate-600">
              <a href="#plans" className="hover:text-electric">Compare plans</a>
              <a href="#starter" className="hover:text-electric">Starter</a>
              <a href="#growth" className="hover:text-electric">Growth</a>
              <a href="#professional" className="hover:text-electric">Professional</a>
              <a href="#add-ons" className="hover:text-electric">Add-ons</a>
            </div>
          </nav>

          <section id="plans" className="scroll-mt-24 py-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl"><p className="eyebrow">After the beta</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Choose the control your business needs.</h2><p className="mt-3 leading-7 text-slate-600">Every membership supports a controlled collection workflow. Growth adds intelligent recommendations; Professional adds deeper evidence and oversight.</p></div>
              <p className="w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-slate-600">Planned prices · VAT position to be confirmed</p>
            </div>

            <div className="mt-9 grid gap-7 lg:grid-cols-3">
              {plans.map(plan => {
                const id = plan.name.toLowerCase();
                const highlights: Record<string, string[]> = {
                  Starter: ["Priority Score and chase list", "Three-stage reminders", "Statements and payment promises"],
                  Growth: ["Everything in Starter", "Copilot action plans", "Smart timing and behaviour insights"],
                  Professional: ["Everything in Growth", "Complete collection histories", "Evidence packs and premium insights"],
                };
                const cardStyle = plan.name === "Starter"
                  ? "border-cyan-200 bg-gradient-to-br from-white via-cyan-50/70 to-blue-100/70"
                  : plan.featured
                    ? "border-blue-500 bg-gradient-to-br from-white via-blue-50/80 to-violet-100/70 ring-2 ring-blue-500/10"
                    : "border-violet-200 bg-gradient-to-br from-white via-indigo-50/60 to-violet-100/80";
                return <article key={plan.name} className={`group relative flex min-h-[590px] flex-col overflow-hidden rounded-[2rem] border p-8 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${cardStyle}`}>
                  {plan.featured && <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20">Most popular</span>}
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{plan.featured ? "Recommended" : "Membership"}</p>
                  <h3 className="mt-5 text-3xl font-bold text-ink">{plan.name}</h3>
                  <div className="mt-7 flex items-end gap-2"><span className="text-5xl font-bold tracking-tight text-ink">{plan.price}</span><span className="pb-1.5 text-sm font-semibold text-slate-500">/ month</span></div>
                  <p className="mt-5 min-h-[3rem] text-sm leading-6 text-slate-600">{plan.name === "Starter" ? "A consistent collection process for small teams." : plan.name === "Growth" ? "Intelligent follow-up for established SMEs." : "Deeper oversight, history and evidence for finance teams."}</p>
                  <p className="mt-6 w-fit rounded-full bg-blue-50/90 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm">{plan.limit}</p>
                  <div className="mt-7 flex-1 space-y-4">{highlights[plan.name].map(feature => <div key={feature} className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} /><span>{feature}</span></div>)}</div>
                  <a href={`#${id}`} className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-4 text-sm font-bold transition duration-200 ${plan.featured ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700" : "border border-blue-200 bg-white/45 text-blue-600 hover:border-blue-300 hover:bg-white/80"}`}>Show all information <ArrowRight className="ml-3" size={17} /></a>
                </article>;
              })}
            </div>
          </section>

          <section className="space-y-8 border-t border-slate-200 py-14">
            {plans.map((plan, index) => {
              const id = plan.name.toLowerCase();
              return <article id={id} key={plan.name} className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="grid lg:grid-cols-[.72fr_1.28fr]">
                  <div className={`p-7 sm:p-9 ${plan.featured ? "bg-gradient-to-br from-[#10285f] to-[#2764ff] text-white" : "bg-gradient-to-br from-slate-100 to-blue-50 text-ink"}`}>
                    <span className={`grid h-12 w-12 place-items-center rounded-xl ${plan.featured ? "bg-white/15 text-white" : "bg-white text-electric shadow-sm"}`}>{index === 1 ? <Sparkles size={23} /> : <Layers3 size={23} />}</span>
                    <p className={`mt-7 text-xs font-bold uppercase tracking-[0.16em] ${plan.featured ? "text-blue-200" : "text-electric"}`}>{plan.strapline}</p>
                    <h2 className="mt-3 text-3xl font-bold">{plan.name}</h2>
                    <p className={`mt-4 leading-7 ${plan.featured ? "text-blue-100" : "text-slate-600"}`}>{plan.description}</p>
                    <p className="mt-7 text-4xl font-bold">{plan.price}<span className={`ml-2 text-sm ${plan.featured ? "text-blue-200" : "text-slate-500"}`}>/ month</span></p>
                    <p className={`mt-3 text-sm font-bold ${plan.featured ? "text-white" : "text-ink"}`}>Up to {plan.limit}</p>
                    {plan.featured && <span className="mt-5 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">Recommended for established SMEs</span>}
                  </div>

                  <div className="p-7 sm:p-9">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Everything included</p>
                    <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">{plan.features.map(feature => <div key={feature} className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} /><p className="text-sm leading-6 text-slate-700">{feature}</p></div>)}</div>
                    <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-electric">Best suited to</p><p className="mt-2 text-sm leading-6 text-slate-700">{plan.bestFor}</p></div>
                    <div className="mt-7 flex flex-wrap items-center gap-3"><button type="button" disabled className={`cursor-not-allowed rounded-xl px-5 py-3 text-sm font-bold opacity-70 ${plan.featured ? "bg-electric text-white" : "border border-slate-200 bg-slate-50 text-slate-500"}`}>Available after beta</button><a href="#plans" className="text-sm font-bold text-electric">Back to comparison</a></div>
                  </div>
                </div>
              </article>;
            })}
          </section>

          <section id="add-ons" className="scroll-mt-24 py-14">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl sm:p-9">
              <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Premium add-ons</p><h2 className="mt-2 text-3xl font-bold">Add capacity without changing membership.</h2><p className="mt-3 text-sm leading-6 text-blue-100">Increase invoice capacity or user access only when your business needs it.</p></div><span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-blue-100"><Zap className="mr-2 text-cyan-300" size={15} />Flexible monthly capacity</span></div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{premiumAddOns.map(addOn => <article key={addOn.name} className="group rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"><CreditCard className="text-cyan-300" size={21} /><p className="mt-4 text-sm font-bold text-white">{addOn.name}</p><p className="mt-3 text-3xl font-bold">{addOn.price}<span className="ml-2 text-xs font-semibold text-blue-200">{addOn.term}</span></p><p className="mt-3 text-sm leading-6 text-blue-100">{addOn.description}</p></article>)}</div>
              <div className="mt-5 rounded-2xl border border-amber-200/30 bg-amber-100/10 px-5 py-4"><p className="text-sm font-bold text-amber-100">Company-risk checks</p><p className="mt-1 text-xs leading-5 text-blue-100">Creditsafe pricing will be added after supplier costs, API access and data rights are confirmed. It will not be advertised as unlimited.</p></div>
            </div>
          </section>

          <section className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white p-6">
            <div><h3 className="font-bold text-ink">Need to cancel?</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Your data is not deleted immediately. Submit a request and we will confirm the cancellation.</p></div>
            <form action={requestCancellation}><button className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100" type="submit">Request cancellation</button></form>
          </section>
        </div>
      </div>
    </main>
  );
}

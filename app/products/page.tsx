import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "£49",
    limit: "Up to 150 active invoices",
    strapline: "Essential credit control",
    description: "For small businesses and lean finance teams building a reliable, organised collection process.",
    features: [
      "Today’s prioritised chase list",
      "CreditPilot Priority Score and chase prioritisation",
      "Customer and invoice management with CSV import",
      "Three-stage editable reminders with human approval",
      "Customer statements",
      "Payment-promise recording and missed-promise identification",
      "Basic disputes, chase holds and collection timeline",
      "Invoice ageing, audit trail and workspace export",
      "Legal-protection checklist and core email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "£129",
    limit: "Up to 750 active invoices",
    strapline: "Intelligent credit control",
    description: "For established SMEs managing regular credit-control activity and a busier debtor book.",
    featured: true,
    features: [
      "Everything included in Starter",
      "Copilot action plans and workspace questions",
      "AI-assisted reply analysis and suggested wording",
      "Smart reminder timing and recommended next actions",
      "Customer payment-behaviour recommendations",
      "Broken-promise monitoring and alerts",
      "Advanced disputes and chase holds",
      "Complete customer timeline and enhanced analytics",
      "Suggested credit limits and risk-check readiness",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "£249",
    limit: "Up to 2,500 active invoices",
    strapline: "Complete oversight and evidence",
    description: "For finance teams requiring deeper history, stronger evidence and escalation support.",
    features: [
      "Everything included in Growth",
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

const addOns = [
  { name: "Extra 250 invoices", price: "£25", term: "/ month", description: "Add capacity without moving to the next membership." },
  { name: "Extra 1,000 invoices", price: "£65", term: "/ month", description: "A larger capacity increase for an expanding debtor book." },
  { name: "Additional Growth user", price: "£12", term: "/ user / month", description: "Give another team member access to your Growth workspace." },
  { name: "Additional Professional user", price: "£18", term: "/ user / month", description: "Add a user to a Professional workspace." },
];

export default function ProductsPage() {
  return <main className="min-h-screen bg-[#f5f6f8] text-slate-800">
    <MarketingNav />
    <section className="border-b border-slate-200 bg-gradient-to-br from-white via-blue-50/50 to-slate-100 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="eyebrow">CreditPilot memberships</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-6xl">Credit-control support that grows with your debtor book.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">Compare the planned post-beta memberships and optional capacity add-ons. During the founding beta, every customer can use all currently available CreditPilot features free.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="button-primary">Start free beta <ArrowRight className="ml-2" size={17} /></Link>
          <Link href="#plans" className="button-secondary">Explore memberships</Link>
        </div>
      </div>
    </section>

    <nav aria-label="Product sections" className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
        <Link href="#starter" className="hover:text-electric">Starter</Link>
        <Link href="#growth" className="hover:text-electric">Growth</Link>
        <Link href="#professional" className="hover:text-electric">Professional</Link>
        <Link href="#add-ons" className="hover:text-electric">Premium add-ons</Link>
      </div>
    </nav>

    <section id="plans" className="scroll-mt-20 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Three memberships</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Choose the control and capacity you need.</h2>
          <p className="mt-4 leading-7 text-slate-600">Every level keeps your team in control of customer communication. Growth adds intelligent recommendations; Professional adds deeper evidence and oversight.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map(plan => <article key={plan.id} className={`relative flex flex-col rounded-3xl border bg-white p-7 shadow-card ${plan.featured ? "border-electric ring-2 ring-electric/10" : "border-slate-200"}`}>
            {plan.featured && <span className="absolute right-5 top-5 rounded-full bg-electric px-3 py-1.5 text-xs font-bold text-white">Most popular</span>}
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">{plan.strapline}</p>
            <h3 className="mt-3 text-3xl font-bold text-ink">{plan.name}</h3>
            <div className="mt-5 flex items-end gap-2"><span className="text-4xl font-bold text-ink">{plan.price}</span><span className="pb-1 text-sm font-semibold text-slate-500">/ month</span></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
            <p className="mt-5 w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800">{plan.limit}</p>
            <Link href={`#${plan.id}`} className="mt-7 inline-flex items-center text-sm font-bold text-electric">Show all information <ArrowRight className="ml-2" size={16} /></Link>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200 bg-white px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {plans.map((plan,index) => <article id={plan.id} key={plan.id} className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-[#f8fafc]">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className={`p-7 sm:p-9 ${plan.featured ? "bg-gradient-to-br from-[#10285f] to-[#2764ff] text-white" : "bg-slate-100 text-ink"}`}>
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${plan.featured ? "bg-white/15 text-white" : "bg-white text-electric"}`}>{index === 1 ? <Sparkles size={23} /> : <Layers3 size={23} />}</span>
              <p className={`mt-7 text-xs font-bold uppercase tracking-[0.16em] ${plan.featured ? "text-blue-200" : "text-electric"}`}>{plan.strapline}</p>
              <h2 className="mt-3 text-3xl font-bold">{plan.name}</h2>
              <p className={`mt-4 leading-7 ${plan.featured ? "text-blue-100" : "text-slate-600"}`}>{plan.description}</p>
              <p className={`mt-6 text-sm font-bold ${plan.featured ? "text-white" : "text-ink"}`}>{plan.limit}</p>
              <p className="mt-2 text-3xl font-bold">{plan.price}<span className={`ml-2 text-sm ${plan.featured ? "text-blue-200" : "text-slate-500"}`}>/ month</span></p>
            </div>
            <div className="p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">What this membership offers</p>
              <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {plan.features.map(feature => <div key={feature} className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={19} /><p className="text-sm leading-6 text-slate-700">{feature}</p></div>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="button-primary">Start free beta</Link>
                <Link href="#plans" className="button-secondary">Back to memberships</Link>
              </div>
            </div>
          </div>
        </article>)}
      </div>
    </section>

    <section id="add-ons" className="scroll-mt-24 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl sm:p-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Premium add-ons</p>
          <h2 className="mt-3 text-3xl font-bold">Add capacity without changing your membership.</h2>
          <p className="mt-4 leading-7 text-blue-100">Choose only the additional invoice capacity or user access your business needs.</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {addOns.map(addOn => <article key={addOn.name} className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <h3 className="font-bold text-white">{addOn.name}</h3>
            <p className="mt-4 text-3xl font-bold">{addOn.price}</p>
            <p className="mt-1 text-xs font-semibold text-blue-200">{addOn.term}</p>
            <p className="mt-4 text-sm leading-6 text-blue-100">{addOn.description}</p>
          </article>)}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200/30 bg-amber-100/10 p-5">
          <p className="font-bold text-amber-100">Company-risk checks</p>
          <p className="mt-2 text-sm leading-6 text-blue-100">Pricing will be published only after supplier costs, API access and data rights are confirmed. This service will not be advertised as unlimited.</p>
        </div>
      </div>
    </section>

    <section className="px-6 pb-20 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-card sm:p-12">
        <p className="eyebrow">Founding beta · £0</p>
        <h2 className="mt-4 text-3xl font-bold text-ink">Try every currently available feature free.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">No subscription charge, card, contract or automatic conversion to a paid plan. You will receive notice and actively choose a membership before billing begins.</p>
        <Link href="/register" className="button-primary mt-8">Create your free beta account <ArrowRight className="ml-2" size={17} /></Link>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white px-6 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-ink">CreditPilot AI</p><p className="mt-1">Smarter credit control for UK and European businesses.</p></div><nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer"><Link href="/">Home</Link><Link href="/compliance">Compliance</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/register">Start free beta</Link></nav><p>© {new Date().getFullYear()} CreditPilot AI</p></div></footer>
  </main>;
}

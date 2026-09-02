import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { PricingCalculator } from "@/components/pricing-calculator";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "£49",
    limit: "Up to 150 active invoices",
    strapline: "Essential credit control for small businesses",
    description: "Designed for small businesses that need a consistent and organised collection process.",
    bestFor: "Small businesses establishing a reliable and consistent credit-control process.",
    features: [
      "Up to 150 active invoices",
      "Credit-control overview dashboard",
      "Today’s prioritised chase list",
      "Explainable CreditPilot Priority Score",
      "Customer management",
      "Invoice management",
      "CSV invoice import",
      "Three-stage reminder workflow",
      "Editable reminder drafts",
      "Human approval before reminders are sent",
      "Customer statements",
      "Record invoices as paid",
      "Record payment promises",
      "Identify missed payment promises",
      "Basic dispute and chase-hold controls",
      "Customer collection timeline",
      "Basic invoice audit trail",
      "Legal-protection confirmation checklist",
      "Invoice-ageing overview",
      "Bank-transfer payment instructions",
      "Workspace data export",
      "Core email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "£129",
    limit: "Up to 750 active invoices",
    strapline: "Intelligent credit control for growing businesses",
    description: "Designed for established SMEs managing a larger debtor book and more complex collection cases.",
    bestFor: "Growing businesses with regular credit-control activity, a busier debtor book and customers requiring more detailed follow-up.",
    featured: true,
    features: [
      "Everything included in Starter",
      "Up to 750 active invoices",
      "Copilot action plans",
      "Ask Copilot questions about invoices, customers, payments and reminders",
      "AI-assisted customer-reply analysis",
      "Suggested customer-response wording",
      "Smart reminder timing based on recorded payment patterns",
      "Customer payment-behaviour recommendations",
      "Suggested customer credit limits",
      "Broken-promise monitoring and alerts",
      "Recommended follow-up actions",
      "Advanced dispute controls",
      "Pause chase communications with a recorded reason",
      "Case ownership and workflow controls",
      "Complete customer collection timeline",
      "Enhanced collection analytics",
      "Promise-kept rate",
      "Payment-rate reporting",
      "Largest outstanding balance reporting",
      "External company-risk checks through Creditsafe once configured",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "£249",
    limit: "Up to 2,500 active invoices",
    strapline: "Complete oversight and evidence for larger teams",
    description: "Designed for larger finance teams requiring deeper collection history, audit evidence and escalation support.",
    bestFor: "Larger finance teams, credit-control departments and businesses requiring documented evidence before escalation.",
    features: [
      "Everything included in Growth",
      "Up to 2,500 active invoices",
      "Complete invoice collection history",
      "Complete customer collection history",
      "Detailed reminder history",
      "Payment-promise and broken-promise history",
      "Dispute and chase-hold history",
      "Case-ownership decision history",
      "Complete invoice audit trail",
      "Communication approval and sending records",
      "Email-delivery evidence",
      "Legal-protection status",
      "Downloadable customer collection packs",
      "Evidence-pack exports",
      "Deeper escalation evidence",
      "Premium customer-risk insights",
      "Premium payment-behaviour insights",
      "Higher-volume collection analytics",
      "Higher-volume collection management",
    ],
  },
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
          {plans.map(plan => <article key={plan.id} className={`relative flex flex-col overflow-hidden rounded-3xl border p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.name === "Starter" ? "border-cyan-200 bg-gradient-to-br from-white via-cyan-50/80 to-blue-100/70" : plan.featured ? "border-electric bg-gradient-to-br from-white via-blue-50 to-violet-100/80 ring-2 ring-electric/10" : "border-violet-200 bg-gradient-to-br from-white via-indigo-50/80 to-violet-100/70"}`}>
            {plan.featured && <span className="absolute right-5 top-5 z-10 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">Most popular</span>}
            <span aria-hidden="true" className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl ${plan.name === "Starter" ? "bg-cyan-300/25" : plan.featured ? "bg-violet-400/30" : "bg-indigo-300/25"}`} />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">{plan.strapline}</p>
            <h3 className="mt-3 text-3xl font-bold text-ink">{plan.name}</h3>
            <div className="mt-5 flex items-end gap-2"><span className="text-4xl font-bold text-ink">{plan.price}</span><span className="pb-1 text-sm font-semibold text-slate-500">/ month</span></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
            <p className="mt-5 w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800">{plan.limit}</p>
            <a href={`#${plan.id}`} className="mt-7 inline-flex items-center text-sm font-bold text-electric">Show all information <ArrowRight className="ml-2" size={16} /></a>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200 bg-white px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        {plans.map((plan,index) => <article id={plan.id} key={plan.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-sm transition hover:shadow-md">
          <div className="grid lg:grid-cols-[0.62fr_1.38fr]">
            <div className={`p-6 sm:p-7 ${plan.featured ? "bg-gradient-to-br from-[#10285f] to-[#2764ff] text-white" : "bg-slate-100 text-ink"}`}>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${plan.featured ? "bg-white/15 text-white" : "bg-white text-electric"}`}>{index === 1 ? <Sparkles size={20} /> : <Layers3 size={20} />}</span>
              <p className={`mt-5 text-[10px] font-bold uppercase tracking-[0.14em] ${plan.featured ? "text-blue-200" : "text-electric"}`}>{plan.strapline}</p>
              <h2 className="mt-2 text-2xl font-bold">{plan.name}</h2>
              <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-blue-100" : "text-slate-600"}`}>{plan.description}</p>
              <p className={`mt-4 text-sm font-bold ${plan.featured ? "text-white" : "text-ink"}`}>{plan.limit}</p>
              <p className="mt-2 text-2xl font-bold">{plan.price}<span className={`ml-2 text-sm ${plan.featured ? "text-blue-200" : "text-slate-500"}`}>/ month</span></p>
            </div>
            <div className="p-6 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">What this membership offers</p>
              <div className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {plan.features.map(feature => <div key={feature} className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} /><p className="text-[13px] leading-5 text-slate-700">{feature}</p></div>)}
              </div>
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-electric">Best suited to</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{plan.bestFor}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/register" className="button-primary">Start free beta</Link>
                <Link href="#plans" className="button-secondary">Back to memberships</Link>
              </div>
            </div>
          </div>
        </article>)}
      </div>
    </section>

    <section id="add-ons" className="scroll-mt-24 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PricingCalculator />
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

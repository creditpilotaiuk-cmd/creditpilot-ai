import Link from "next/link";
import { AlertTriangle, ArrowRight, Bot, CheckCircle2, Clock3, CreditCard, Database, FileCheck2, LockKeyhole, Mail, Scale, ShieldCheck, Sparkles, UserCheck, Wrench, type LucideIcon } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";

const clauses = [
  { id: "service", icon: Wrench, title: "1. The service", summary: "What CreditPilot does—and does not do", text: "CreditPilot organises imported invoice data, priorities, recommended actions, reminders, promises, disputes and collection history. It is not accounting software, a credit-reference agency, debt collection agency or legal adviser, and does not guarantee payment.", colour: "bg-blue-100 text-blue-700" },
  { id: "human-control", icon: Bot, title: "2. Human control and AI", summary: "AI supports decisions; people remain responsible", text: "AI-assisted output may be inaccurate or incomplete. You must review every recommendation and communication before relying on or sending it. CreditPilot does not independently decide whether to grant credit, enforce a debt or begin legal action.", colour: "bg-violet-100 text-violet-700" },
  { id: "responsibilities", icon: UserCheck, title: "3. Your responsibilities", summary: "Use accurate data and follow applicable rules", text: "You are responsible for accurate data, lawful collection activity, an appropriate data-protection basis, required privacy information, communication rules, recipient objections and the authority to upload data. Do not use the service for harassment, discrimination, unlawful profiling or misleading communications.", colour: "bg-cyan-100 text-cyan-700" },
  { id: "communications", icon: Mail, title: "4. Communications", summary: "Every recipient, message and send remains your choice", text: "Drafts and timing suggestions remain under user control. You are responsible for tone, recipients, frequency and legal compliance. Delivery may be affected by recipient systems, provider outages or spam controls.", colour: "bg-amber-100 text-amber-700" },
  { id: "data", icon: Database, title: "5. Data, exports and deletion", summary: "Your ledger remains authoritative", text: "Your accounting platform remains the system of record. You should keep appropriate backups and reconcile material changes. Workspace exports and privacy requests are available in Settings. Deletion may be limited where records must be retained for law, security, tax or legal claims.", colour: "bg-emerald-100 text-emerald-700" },
  { id: "security", icon: LockKeyhole, title: "6. Security and access", summary: "Protect credentials and report suspected compromise", text: "Keep credentials secure, use the service only through authorised accounts and notify us promptly of suspected compromise. We may restrict access needed to protect users, data or the service.", colour: "bg-slate-200 text-slate-700" },
  { id: "beta", icon: Sparkles, title: "7. Beta, integrations and availability", summary: "Features may change while the service develops", text: "Features may change during beta. CreditPilot does not submit VAT returns, provide bookkeeping services or replace HMRC-compatible accounting software. Invoice data is currently imported into CreditPilot. Direct integrations with Xero, QuickBooks and Sage are planned features and do not currently exist. Customers remain responsible for maintaining accurate financial records in their accounting software and completing applicable accounting, tax and regulatory submissions. The service is provided as available and may be suspended for maintenance, security or provider disruption.", colour: "bg-blue-100 text-blue-700" },
  { id: "plans", icon: CreditCard, title: "8. Plans and cancellation", summary: "Charges require clear paid terms first", text: "Current beta access is free unless the Membership page says otherwise. Paid terms, taxes, renewal and cancellation details will be shown before a charge is accepted.", colour: "bg-violet-100 text-violet-700" },
  { id: "liability", icon: ShieldCheck, title: "9. Liability", summary: "Important limits on service responsibility", text: "To the extent permitted by law, CreditPilot is not responsible for indirect losses, customer non-payment or decisions made from unverified data or AI output. Nothing excludes liability that cannot legally be excluded.", colour: "bg-amber-100 text-amber-700" },
  { id: "changes", icon: Scale, title: "10. Changes and law", summary: "The current version will remain published here", text: "We may update these terms as the beta develops and will publish the current version here. The governing law, contracting entity, address and dispute route must be confirmed in the final commercial terms.", colour: "bg-rose-100 text-rose-700" },
];

export default function TermsPage() {
  return <main className="min-h-screen bg-[#f5f7fa] text-slate-800">
    <div className="bg-white"><MarketingNav /></div>

    <section className="relative overflow-hidden bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] px-5 py-14 text-white sm:px-8 sm:py-20">
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100"><Scale size={15} />Legal · Beta terms</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Terms and Conditions</h1>
          <p className="mt-4 text-sm font-semibold text-blue-200">Last updated: 27 August 2026</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">These terms govern the CreditPilot AI beta, a dedicated credit-control workflow service that works alongside accounting software. By creating an account or using the service, you agree to them.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Summary icon={UserCheck} title="Human control" text="Review every recommendation and communication" />
          <Summary icon={Database} title="Your ledger" text="Remains the authoritative financial record" />
          <Summary icon={Sparkles} title="Free beta" text="Paid terms shown before any charge" />
          <Summary icon={ShieldCheck} title="Responsible use" text="Lawful collection activity is required" />
        </div>
      </div>
    </section>

    <nav aria-label="Terms sections" className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-slate-600">
        <a href="#service" className="hover:text-electric">Service & AI</a>
        <a href="#responsibilities" className="hover:text-electric">Your responsibilities</a>
        <a href="#data" className="hover:text-electric">Data & security</a>
        <a href="#beta" className="hover:text-electric">Beta & plans</a>
        <a href="#liability" className="hover:text-electric">Liability & law</a>
      </div>
    </nav>

    <section className="px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[.68fr_1.32fr]">
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Important principles</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">What to know first</h2>
              <div className="mt-5 space-y-4">
                <Principle icon={CheckCircle2}>A person reviews messages and decisions.</Principle>
                <Principle icon={FileCheck2}>CreditPilot supports—but does not replace—your accounting records.</Principle>
                <Principle icon={ShieldCheck}>Your organisation remains responsible for lawful use.</Principle>
                <Principle icon={Clock3}>Beta features and availability may change.</Principle>
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} /><div><h2 className="font-bold text-ink">Beta legal status</h2><p className="mt-2 text-sm leading-6 !text-[#334155]">These are transparent working terms, not a substitute for signed commercial terms. They require review by a qualified solicitor before accepting paying UK or European customers.</p></div></div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="button-secondary">Privacy Notice</Link>
              <Link href="/compliance" className="button-secondary">Compliance Centre</Link>
            </div>
          </aside>

          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b bg-gradient-to-r from-white to-blue-50/70 p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Complete terms</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">Your agreement with CreditPilot AI</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Read each clause carefully. The summaries help navigation but do not replace the complete wording.</p>
            </div>

            <div className="divide-y divide-slate-200">
              {clauses.map(({ id, icon: Icon, title, summary, text, colour }) => <section id={id} key={id} className="scroll-mt-24 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${colour}`}><Icon size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold !text-[#07183f]">{title}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-electric">{summary}</p>
                    <p className="mt-4 leading-7 !text-[#334155]">{text}</p>
                  </div>
                </div>
              </section>)}
            </div>
          </article>
        </div>
      </div>
    </section>

    <section className="px-5 pb-16 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl sm:p-10">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Related information</p><h2 className="mt-3 text-2xl font-bold">Understand how CreditPilot handles data and safeguards.</h2></div>
        <Link href="/compliance" className="button-primary">Open Compliance Centre <ArrowRight className="ml-2" size={17} /></Link>
      </div>
    </section>
  </main>;
}

function Summary({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><Icon className="text-cyan-300" size={20} /><p className="mt-3 font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-blue-100">{text}</p></div>;
}

function Principle({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return <div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Icon size={16} /></span><p className="pt-1 text-sm leading-6 !text-[#334155]">{children}</p></div>;
}

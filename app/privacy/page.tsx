import Link from "next/link";
import { AlertTriangle, ArrowRight, Bot, Building2, Clock3, Database, Download, FileKey2, Globe2, KeyRound, LockKeyhole, Scale, ShieldCheck, UserCheck, type LucideIcon } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";

const sections = [
  { id: "role", icon: Building2, title: "1. Our role", summary: "Responsibility depends on the processing context", content: <>A subscribing business normally controls the customer, invoice and collection data it uploads. CreditPilot provides the service and processes that data on its instructions. CreditPilot is separately responsible for account administration, security, support, billing and service operation. Roles may vary with the facts.</>, colour: "bg-blue-100 text-blue-700" },
  { id: "information", icon: Database, title: "2. Information handled", summary: "The information required to provide and secure the service", content: <>We may handle names, business contact details, account credentials, company settings, invoice details, payment status, communications, promises to pay, disputes, workflow actions, audit events, support information and technical security records. We do not ask users to upload special-category data unless it is genuinely necessary and lawful.</>, colour: "bg-cyan-100 text-cyan-700" },
  { id: "purposes", icon: Scale, title: "3. Purposes and lawful grounds", summary: "Why information is used and the grounds that may apply", content: <>Information is used to authenticate users, operate and secure workspaces, organise collection work, prepare user-approved communications, provide support, administer the beta and meet legal duties. Depending on the activity, processing may rely on contract, legitimate interests, legal obligation or consent where consent is required. Customer organisations must determine and document the basis for their own collection activity.</>, colour: "bg-amber-100 text-amber-700" },
  { id: "ai", icon: Bot, title: "4. AI-assisted features", summary: "AI output is visible assistance requiring human review", content: <>CreditPilot may use AI to suggest priorities, wording, classifications or next actions. These outputs are assistance, may be incomplete and require human review. CreditPilot does not use them to make or execute solely automated legal, credit or enforcement decisions about a person.</>, colour: "bg-violet-100 text-violet-700" },
  { id: "sharing", icon: Globe2, title: "5. Sharing and international transfers", summary: "Limited sharing with service providers and lawful safeguards", content: <>Information is shared only as needed with providers supporting hosting, databases, email, payments, security, support and optional AI functions, or where law requires it. Where personal data is transferred internationally, appropriate contractual or other recognised safeguards should be used and kept under review.</>, colour: "bg-blue-100 text-blue-700" },
  { id: "retention", icon: Clock3, title: "6. Retention and deletion", summary: "Records are kept only for justified periods", content: <>Information is kept only for as long as needed for the service, the collection purpose, security, legal obligations, dispute resolution or legal claims. Retention can vary by record and customer instruction. Account deletion requests are reviewed before removal because some financial or audit records may lawfully need to be retained.</>, colour: "bg-slate-200 text-slate-700" },
  { id: "rights", icon: UserCheck, title: "7. Your rights", summary: "Privacy rights depend on applicable law and circumstances", content: <>Depending on the applicable UK or EU law and circumstances, you may request access, correction, erasure, restriction, portability or object to processing. You may also complain to the relevant supervisory authority. We may verify identity and will explain if a request cannot be fulfilled in full.</>, colour: "bg-emerald-100 text-emerald-700" },
  { id: "requests", icon: FileKey2, title: "8. How to make a request", summary: "Workspace users can export data and record requests", content: <>Signed-in users can download workspace data and record a request in Settings. If your details appear in another business&apos;s workspace, contact that business first because it normally controls the record; CreditPilot will support verified requests from it. Requests should be answered without undue delay and normally within the applicable statutory period.</>, colour: "bg-emerald-100 text-emerald-700" },
  { id: "security", icon: LockKeyhole, title: "9. Security and cookies", summary: "Technical safeguards support—but cannot eliminate—risk", content: <>We use access controls, password hashing, company-scoped queries, private downloads, audit logging and protective browser headers. No system is risk-free. See our <Link className="font-bold text-electric underline decoration-blue-200 underline-offset-4" href="/cookies">Cookie Notice</Link> for essential session cookies.</>, colour: "bg-rose-100 text-rose-700" },
  { id: "changes", icon: ShieldCheck, title: "10. Changes", summary: "The notice will evolve with the service", content: <>We may update this notice as the service, providers and European availability develop. Material changes will be communicated through an appropriate channel.</>, colour: "bg-blue-100 text-blue-700" },
];

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#f5f7fa] text-slate-800">
    <div className="bg-white"><MarketingNav /></div>

    <section className="relative overflow-hidden bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] px-5 py-14 text-white sm:px-8 sm:py-20">
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100"><ShieldCheck size={15} />Legal · Privacy</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Privacy Notice</h1>
          <p className="mt-4 text-sm font-semibold text-blue-200">Last updated: 27 August 2026</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">This notice explains how CreditPilot AI handles personal information in its credit-control system of action. It covers account users and people whose contact or collection information is held in a customer workspace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Summary icon={Building2} title="Defined roles" text="Responsibilities depend on the data context" />
          <Summary icon={UserCheck} title="Human review" text="AI assistance does not make legal decisions" />
          <Summary icon={Download} title="Data rights" text="Export and request tools are available" />
          <Summary icon={LockKeyhole} title="Safeguards" text="Company-scoped access and audit records" />
        </div>
      </div>
    </section>

    <nav aria-label="Privacy sections" className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-slate-600">
        <a href="#role" className="hover:text-electric">Roles & information</a>
        <a href="#purposes" className="hover:text-electric">Purposes & AI</a>
        <a href="#sharing" className="hover:text-electric">Sharing & retention</a>
        <a href="#rights" className="hover:text-electric">Your rights</a>
        <a href="#security" className="hover:text-electric">Security & cookies</a>
      </div>
    </nav>

    <section className="px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[.68fr_1.32fr]">
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Privacy at a glance</p>
              <h2 className="mt-2 text-2xl font-bold !text-[#07183f]">What matters most</h2>
              <div className="mt-5 space-y-4">
                <Principle icon={Building2}>Customer organisations normally control the records they upload.</Principle>
                <Principle icon={Bot}>AI suggestions are assistance and require human review.</Principle>
                <Principle icon={UserCheck}>Eligible individuals may exercise applicable data rights.</Principle>
                <Principle icon={LockKeyhole}>Access, exports and activity are protected and recorded.</Principle>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-start gap-3"><KeyRound className="mt-0.5 shrink-0 text-emerald-700" size={20} /><div><h2 className="font-bold !text-[#07183f]">Exercise your rights</h2><p className="mt-2 text-sm leading-6 !text-[#334155]">Signed-in users can download workspace data or record an access, correction, restriction, objection or erasure request in Settings.</p><Link href="/settings#privacy" className="mt-4 inline-flex items-center text-sm font-bold text-emerald-700">Open privacy settings <ArrowRight className="ml-2" size={16} /></Link></div></div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} /><div><h2 className="font-bold !text-[#07183f]">Current beta notice</h2><p className="mt-2 text-sm leading-6 !text-[#334155]">This notice documents current beta controls; it is not a compliance certification. Commercial-launch details require qualified UK/EU privacy review.</p></div></div>
            </section>

            <div className="flex flex-wrap gap-3"><Link href="/terms" className="button-secondary">Terms</Link><Link href="/compliance" className="button-secondary">Compliance Centre</Link></div>
          </aside>

          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b bg-gradient-to-r from-white to-blue-50/70 p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Complete notice</p>
              <h2 className="mt-2 text-2xl font-bold !text-[#07183f]">How personal information is handled</h2>
              <p className="mt-2 text-sm leading-6 !text-[#334155]">The summaries support navigation but do not replace the complete wording of each section.</p>
            </div>
            <div className="divide-y divide-slate-200">
              {sections.map(({ id, icon: Icon, title, summary, content, colour }) => <section id={id} key={id} className="scroll-mt-24 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${colour}`}><Icon size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold !text-[#07183f]">{title}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-electric">{summary}</p>
                    <p className="mt-4 leading-7 !text-[#334155]">{content}</p>
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
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Privacy controls</p><h2 className="mt-3 text-2xl font-bold">Manage your workspace information and requests.</h2><p className="mt-2 text-sm leading-6 text-blue-100">If your details appear in another business’s workspace, contact that business first because it normally controls the record.</p></div>
        <Link href="/settings#privacy" className="button-primary">Open privacy settings <ArrowRight className="ml-2" size={17} /></Link>
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

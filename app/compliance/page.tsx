import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, CheckCircle2, Database, FileCheck2, Globe2, KeyRound, LockKeyhole, Scale, ShieldCheck, Sparkles, UserCheck, Users, type LucideIcon } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";

const controls = [
  { icon: UserCheck, title: "Human decisions", copy: "AI can suggest wording and a next action, but a person reviews communications and decides whether to act or escalate.", colour: "from-blue-500 to-cyan-400", surface: "bg-blue-50 text-blue-700" },
  { icon: BrainCircuit, title: "Visible AI assistance", copy: "AI-generated recommendations and reply analysis are labelled, explainable and treated as support—not fact or legal advice.", colour: "from-violet-500 to-fuchsia-400", surface: "bg-violet-50 text-violet-700" },
  { icon: Database, title: "Data rights support", copy: "Signed-in users can export workspace data and record access, correction, restriction, objection or erasure requests.", colour: "from-emerald-500 to-teal-400", surface: "bg-emerald-50 text-emerald-700" },
  { icon: ShieldCheck, title: "Traceable collection work", copy: "Approvals, exports, rights requests and collection activity are recorded in the workspace audit trail.", colour: "from-amber-500 to-orange-400", surface: "bg-amber-50 text-amber-700" },
];

const dataMap = [
  { icon: Building2, data: "Account and company", purpose: "Authentication, workspace and support", control: "Access-controlled, with export and request tools" },
  { icon: Database, data: "Customers and invoices", purpose: "Prioritisation and collection workflow", control: "Company-scoped; your ledger stays authoritative" },
  { icon: FileCheck2, data: "Reminders and replies", purpose: "Prepare and record communications", control: "Draft, review and approval before sending" },
  { icon: Users, data: "Promises, disputes and actions", purpose: "Track commitments and ownership", control: "Recorded in the timeline and audit history" },
  { icon: BrainCircuit, data: "AI prompts and outputs", purpose: "Suggested wording and next actions", control: "Labelled assistance; human decision required" },
];

export default function CompliancePage() {
  return <main className="min-h-screen bg-[#f5f7fa] text-slate-800">
    <div className="bg-white"><MarketingNav /></div>

    <section className="relative overflow-hidden bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] px-5 py-16 text-white sm:px-8 sm:py-20">
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100"><Globe2 size={15} />Europe-ready foundation</span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">Practical privacy, visible AI and human control.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">CreditPilot is being built as a credit-control system of action for UK and European teams. This centre explains the operational safeguards in the current beta.</p>
          <p className="mt-4 inline-flex items-start gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-blue-100"><Scale className="mt-0.5 shrink-0 text-cyan-300" size={18} />This information describes current product controls. It is not a certification or a substitute for legal advice.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TrustSignal icon={UserCheck} value="Human" label="approval before sending" />
          <TrustSignal icon={BrainCircuit} value="Visible" label="AI-assisted outputs" />
          <TrustSignal icon={LockKeyhole} value="Scoped" label="workspace access" />
          <TrustSignal icon={FileCheck2} value="Recorded" label="collection decisions" />
        </div>
      </div>
    </section>

    <nav aria-label="Compliance sections" className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-slate-600">
        <a href="#safeguards" className="hover:text-electric">Safeguards</a>
        <a href="#responsibility" className="hover:text-electric">Responsibilities</a>
        <a href="#data-map" className="hover:text-electric">Data map</a>
        <a href="#operations" className="hover:text-electric">Operational guidance</a>
        <Link href="/privacy" className="hover:text-electric">Privacy notice</Link>
      </div>
    </nav>

    <section id="safeguards" className="scroll-mt-24 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl"><p className="eyebrow">Safeguards in the product</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Control stays with the people doing the work.</h2><p className="mt-4 leading-7 text-slate-600">CreditPilot supports collection decisions with structured information, transparent assistance and an evidence trail.</p></div>
        <div className="mt-9 grid gap-5 sm:grid-cols-2">{controls.map(({ icon: Icon, title, copy, colour, surface }) => <article key={title} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${colour}`} />
          <span className={`grid h-12 w-12 place-items-center rounded-2xl ${surface}`}><Icon size={23} /></span>
          <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} />Operational safeguard</div>
        </article>)}</div>
      </div>
    </section>

    <section id="responsibility" className="scroll-mt-24 border-y border-slate-200 bg-white px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-stretch">
          <div className="rounded-3xl bg-gradient-to-br from-[#10285f] to-[#2764ff] p-7 text-white sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15"><Scale size={23} /></span>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Responsibility by context</p>
            <h2 className="mt-3 text-3xl font-bold">Who is responsible for the data?</h2>
            <p className="mt-4 leading-7 text-blue-100">The exact legal role depends on why information is processed and who determines that purpose.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Responsibility icon={Building2} title="Your organisation" badge="Normally the controller">Your organisation usually decides why and how customer, invoice and collection data is used. It remains responsible for its lawful basis, privacy information and collection activity.</Responsibility>
            <Responsibility icon={ShieldCheck} title="CreditPilot" badge="Service processor">CreditPilot processes workspace data to provide the service. It separately determines how account, security, billing and service-administration information is used.</Responsibility>
          </div>
        </div>
      </div>
    </section>

    <section id="data-map" className="scroll-mt-24 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4"><div className="max-w-3xl"><p className="eyebrow">Current data map</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-ink">What the workspace uses—and why.</h2><p className="mt-4 leading-7 text-slate-600">Each data category supports a defined workflow and has a corresponding operational control.</p></div><span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700">Current founding beta</span></div>
        <div className="mt-9 grid gap-4">{dataMap.map(({ icon: Icon, data, purpose, control }, index) => <article key={data} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:grid-cols-[64px_.8fr_1fr_1.2fr] sm:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-electric"><Icon size={22} /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Data category</p><h3 className="mt-1 font-bold text-ink">{data}</h3></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Purpose</p><p className="mt-1 text-sm leading-6 text-slate-600">{purpose}</p></div>
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Control</p><p className="mt-1 text-sm leading-6 text-slate-700">{control}</p></div>
        </article>)}</div>
      </div>
    </section>

    <section id="operations" className="scroll-mt-24 border-y border-slate-200 bg-white px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl"><p className="eyebrow">Operational guidance</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-ink">Compliance is an ongoing business process.</h2><p className="mt-4 leading-7 text-slate-600">Product controls support responsible use, but organisations must apply them within their own legal and operational context.</p></div>
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Info icon={Scale} title="Lawful use">Customers remain responsible for identifying and documenting an appropriate lawful basis, supplying privacy information and respecting objections. Consent is not assumed to be the only available basis.</Info>
          <Info icon={UserCheck} title="Rights handling">The workspace supports access, correction, restriction, objection, portability and erasure workflows. Requests should be verified, recorded and answered without undue delay.</Info>
          <Info icon={Database} title="Retention and deletion">Keep personal data only as long as needed for collection, contractual duties, legal requirements or claims. Retention exceptions may apply.</Info>
          <Info icon={Globe2} title="Providers and transfers">Provider terms, processing locations and lawful transfer safeguards must be reviewed before expanding European availability.</Info>
          <Info icon={FileCheck2} title="Electronic communications">Users must apply the privacy and electronic-marketing rules relevant to their recipient and message. An approval record does not make a communication lawful by itself.</Info>
          <Info icon={LockKeyhole} title="Security and incidents">Authenticated company-scoped access, private exports, audit records and browser protections support security. Controls require continuing review as the beta grows.</Info>
        </div>
      </div>
    </section>

    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-7 rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl sm:p-10">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Use the controls</p><h2 className="mt-3 text-3xl font-bold">Manage your information and privacy requests.</h2><p className="mt-3 text-sm leading-6 text-blue-100">Workspace users can download their data or record a privacy request in Settings. People in a customer’s records should normally contact that customer organisation first.</p></div>
        <div className="flex flex-wrap gap-3"><Link className="button-primary" href="/settings">Open privacy settings <ArrowRight className="ml-2" size={17} /></Link><Link className="rounded-xl border border-white/30 px-4 py-3 text-sm font-bold transition hover:bg-white/10" href="/privacy">Read Privacy Notice</Link></div>
      </div>
    </section>
  </main>;
}

function TrustSignal({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><Icon className="text-cyan-300" size={21} /><p className="mt-3 text-xl font-bold">{value}</p><p className="mt-1 text-xs font-semibold text-blue-100">{label}</p></div>;
}

function Responsibility({ icon: Icon, title, badge, children }: { icon: LucideIcon; title: string; badge: string; children: React.ReactNode }) {
  return <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-electric shadow-sm"><Icon size={21} /></span><span className="mt-5 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{badge}</span><h3 className="mt-3 text-xl font-bold text-ink">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{children}</p></article>;
}

function Info({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-electric"><Icon size={19} /></span><h3 className="mt-4 font-bold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>;
}

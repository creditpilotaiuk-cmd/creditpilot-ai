import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, ChevronRight, CircleUserRound, CloudCog, CreditCard, Download, FileSpreadsheet, Landmark, LockKeyhole, Mail, PlugZap, Save, ShieldCheck, Trash2, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requestAccountDeletion, requestDataRight, saveCompanySettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; deletionRequested?: string; rightsRequested?: string; rightsError?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const params = await searchParams;
  const bankReady = Boolean(user.company.bankAccountName && user.company.bankSortCode && user.company.bankAccountNumber);
  const profileReady = Boolean(user.name && user.company.name && (user.company.billingEmail || user.email));

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Credit control workspace</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Settings & integrations</h1>
      </header>

      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>

        {params.saved ? <Notice>Settings saved successfully.</Notice> : null}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><CloudCog size={14} />Workspace control centre</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Keep your company, payments and data controls in one place.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Manage the details shown in customer communications, choose payment instructions and review integration readiness.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"><p className="text-xs font-semibold text-blue-100">Workspace status</p><p className="mt-1 flex items-center gap-2 font-bold text-emerald-300"><CheckCircle2 size={17} />Active</p></div>
          </div>

          <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Status icon={CircleUserRound} label="Profile" value={profileReady ? "Complete" : "Needs details"} colour={profileReady ? "text-emerald-300" : "text-amber-300"} />
            <Status icon={FileSpreadsheet} label="CSV import" value="Available" colour="text-cyan-300" />
            <Status icon={Landmark} label="Bank details" value={bankReady ? "Ready" : "Not complete"} colour={bankReady ? "text-emerald-300" : "text-amber-300"} />
            <Status icon={PlugZap} label="Direct integrations" value="Roadmap" colour="text-violet-200" />
          </div>
        </section>

        <nav aria-label="Settings sections" className="mt-6 grid gap-3 sm:grid-cols-3">
          <SettingsLink href="#profile" icon={Building2} title="Profile & company" description="Identity and billing details" />
          <SettingsLink href="#payments" icon={CreditCard} title="Payment options" description="Customer payment instructions" />
          <SettingsLink href="#privacy" icon={ShieldCheck} title="Privacy & data" description="Exports and rights requests" />
        </nav>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="grid lg:grid-cols-[.75fr_1.25fr]">
            <div className="bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Integration roadmap</p>
              <h2 className="mt-2 text-xl font-bold text-ink">Your ledger remains the system of record</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">CSV import is available during beta. Planned connections will begin with read-only access, keeping accounting records protected.</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} />CSV import available now</div>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-7">
              <RoadmapStep number="01" name="Xero" status="Planned first" active />
              <RoadmapStep number="02" name="QuickBooks" status="Planned next" />
              <RoadmapStep number="03" name="Sage" status="Future roadmap" />
            </div>
          </div>
        </section>

        <form action={saveCompanySettings} className="mt-7 space-y-7">
          <section id="profile" className="scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <SectionHeader icon={CircleUserRound} eyebrow="Account identity" title="Profile and company" description="These details identify your workspace and appear in relevant customer communications." />
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <Field name="personalName" label="Your name" value={user.name || ""} placeholder="Peter Ingham" help="Used for dashboard greetings and sender identification." />
              <Field name="name" label="Company name" value={user.company.name} placeholder="Your company" help="Shown as your business identity." />
              <div className="sm:col-span-2"><Field name="billingEmail" label="Billing email" value={user.company.billingEmail || user.email} placeholder="accounts@company.co.uk" type="email" help="Used for membership and account notices." icon={<Mail size={16} />} /></div>
            </div>
          </section>

          <section id="payments" className="scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <SectionHeader icon={CreditCard} eyebrow="Customer payments" title="Payment options" description="Choose how customers can pay and add the bank instructions used on reminders and statements." />
            <div className="p-5 sm:p-7">
              <label className="block text-sm font-bold text-slate-700">Accepted payment method
                <select name="paymentMethods" defaultValue={user.company.paymentMethods} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-blue-100">
                  <option value="STRIPE">Stripe online payments</option>
                  <option value="BANK">Bank transfer</option>
                  <option value="BOTH">Stripe and bank transfer</option>
                </select>
              </label>
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-bold text-ink"><Landmark size={18} className="text-electric" />Bank-transfer instructions</h3><p className="mt-1 text-sm text-slate-600">Complete these fields if customers can pay by bank transfer.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${bankReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{bankReady ? "Details complete" : "Setup incomplete"}</span></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field name="bankAccountName" label="Account name" value={user.company.bankAccountName || ""} placeholder="Your business name" />
                  <Field name="bankSortCode" label="Sort code" value={user.company.bankSortCode || ""} placeholder="12-34-56" />
                  <Field name="bankAccountNumber" label="Account number" value={user.company.bankAccountNumber || ""} placeholder="12345678" />
                  <Field name="paymentReference" label="Payment reference" value={user.company.paymentReference || ""} placeholder="Invoice number" />
                </div>
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex justify-end"><button className="inline-flex items-center rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700" type="submit"><Save className="mr-2" size={17} />Save workspace settings</button></div>
        </form>

        <section id="privacy" className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <SectionHeader icon={ShieldCheck} eyebrow="Your information" title="Privacy rights & workspace data" description="Download your information or record a formal data-rights request for review." />
          <div className="p-5 sm:p-7">
            {params.rightsRequested ? <Notice>Your {params.rightsRequested} request has been recorded for review.</Notice> : null}
            {params.rightsError ? <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">Choose a valid request type.</p> : null}
            <div className="grid gap-4 lg:grid-cols-2">
              <a className="group flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-5 transition hover:border-blue-300 hover:shadow-md" href="/api/privacy/export"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-electric"><Download size={19} /></span><span><strong className="block text-ink">Download workspace data</strong><span className="mt-1 block text-xs text-slate-500">Receive a machine-readable copy now</span></span></span><ChevronRight className="text-electric transition group-hover:translate-x-1" size={18} /></a>
              <form action={requestDataRight} className="rounded-2xl border border-slate-200 p-5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="requestType">Privacy request type</label>
                <div className="mt-2 flex flex-wrap gap-2"><select id="requestType" name="requestType" className="min-w-[190px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" defaultValue="ACCESS"><option value="ACCESS">Access request</option><option value="RECTIFICATION">Correction request</option><option value="RESTRICTION">Restriction request</option><option value="OBJECTION">Objection request</option><option value="ERASURE">Erasure request</option></select><button className="button-primary" type="submit">Record request</button></div>
              </form>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500"><LockKeyhole className="mt-0.5 shrink-0 text-slate-400" size={16} /><p>Requests are logged for review and identity checks may be required. If another organisation controls a customer-contact record, contact that organisation first.</p></div>
          </div>
        </section>

        {params.deletionRequested ? <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Your deletion request has been recorded. We will review it and contact you before changes are made.</p> : null}
        <section className="mt-7 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white p-6">
          <div className="flex max-w-2xl items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700"><Trash2 size={19} /></span><div><h2 className="font-bold text-ink">Request account deletion</h2><p className="mt-1 text-sm leading-6 text-slate-600">Request removal of your account and personal data. Financial or audit records may be retained where legally required.</p></div></div>
          <form action={requestAccountDeletion}><button className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100" type="submit">Request deletion</button></form>
        </section>
      </div>
    </div>
  </main>;
}

function Status({ icon: Icon, label, value, colour }: { icon: LucideIcon; label: string; value: string; colour: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><div className={`flex items-center gap-2 ${colour}`}><Icon size={18} /><span className="font-bold text-white">{value}</span></div><p className="mt-1 text-xs font-semibold text-blue-100">{label}</p></div>;
}

function SettingsLink({ href, icon: Icon, title, description }: { href: string; icon: LucideIcon; title: string; description: string }) {
  return <a href={href} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-electric"><Icon size={19} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-ink">{title}</strong><span className="block truncate text-xs text-slate-500">{description}</span></span><ChevronRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-electric" size={17} /></a>;
}

function RoadmapStep({ number, name, status, active = false }: { number: string; name: string; status: string; active?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${active ? "border-blue-300 bg-blue-50 shadow-md" : "border-slate-200 bg-slate-50"}`}><span className={`text-xs font-bold ${active ? "text-electric" : "text-slate-400"}`}>{number}</span><p className="mt-3 font-bold text-ink">{name}</p><p className="mt-1 text-xs text-slate-500">{status}</p></div>;
}

function SectionHeader({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) {
  return <div className="flex items-start gap-4 border-b bg-gradient-to-r from-white to-blue-50/60 p-5 sm:p-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-electric"><Icon size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-electric">{eyebrow}</p><h2 className="mt-1 text-xl font-bold text-ink">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div>;
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} />{children}</p>;
}

function Field({ name, label, value, placeholder, type = "text", help, icon }: { name: string; label: string; value: string; placeholder: string; type?: string; help?: string; icon?: React.ReactNode }) {
  return <label className="block text-sm font-bold text-slate-700">{label}<div className="relative mt-2">{icon ? <span className="absolute left-3 top-3.5 text-slate-400">{icon}</span> : null}<input name={name} type={type} defaultValue={value} placeholder={placeholder} required className={`w-full rounded-xl border border-slate-200 px-4 py-3 font-normal text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-blue-100 ${icon ? "pl-10" : ""}`} /></div>{help ? <span className="mt-1.5 block text-xs font-normal text-slate-400">{help}</span> : null}</label>;
}

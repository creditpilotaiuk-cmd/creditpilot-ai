import { AlertCircle, ArrowLeft, CheckCircle2, FileText, KeyRound, LifeBuoy, LockKeyhole, MailWarning, ReceiptText, Send, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { submitSupportRequest } from "./actions";

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams;

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">CreditPilot AI support</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Report a problem</h1>
      </header>

      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><LifeBuoy size={14} />Support centre</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Tell us what happened. We’ll help you get moving again.</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">Choose the affected area and include what you expected, what happened instead and any error message you saw.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SupportPoint icon={ShieldCheck} title="Account identified" text="Your workspace details are included automatically." />
              <SupportPoint icon={LockKeyhole} title="Handled securely" text="Share only information relevant to the problem." />
            </div>
          </div>
        </section>

        {params.sent === "1" && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 shrink-0" size={19} /><div><p className="font-bold">Your report has been sent</p><p className="mt-1">The support team will review the details and contact you when there is an update.</p></div></div>}
        {params.error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 shrink-0" size={19} /><div><p className="font-bold">Your report was not sent</p><p className="mt-1">{params.error === "description" ? "Please describe the problem in a little more detail." : params.error === "email-not-configured" ? "Support email is not configured yet. Please contact your workspace owner." : "Please check the details and try again."}</p></div></div>}

        <div className="mt-7 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Common areas</p>
              <h2 className="mt-2 text-xl font-bold text-ink">What can we help with?</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Issue icon={KeyRound} title="Account access" text="Login, verification or workspace access" colour="bg-violet-100 text-violet-700" />
                <Issue icon={Users} title="Customer records" text="Customer details, risk or timelines" colour="bg-cyan-100 text-cyan-700" />
                <Issue icon={ReceiptText} title="Invoices & payments" text="Imports, balances, promises or paid status" colour="bg-blue-100 text-blue-700" />
                <Issue icon={MailWarning} title="Reminders & email" text="Drafts, approval, sending or delivery" colour="bg-amber-100 text-amber-700" />
              </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
              <div className="flex items-start gap-3"><Sparkles className="mt-0.5 shrink-0 text-electric" size={19} /><div><p className="font-bold text-ink">Help us resolve it faster</p><ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600"><li>• Tell us which page you were using</li><li>• Include the exact error message</li><li>• Explain the last action you took</li><li>• Do not include passwords or card details</li></ul></div></div>
            </section>
          </aside>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
              <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-electric"><FileText size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-electric">New support report</p><h2 className="mt-1 text-xl font-bold text-ink">Describe the issue</h2><p className="mt-1 text-sm text-slate-500">Required fields are marked below.</p></div></div>
            </div>

            <form action={submitSupportRequest} className="space-y-6 p-5 sm:p-7">
              <label className="block text-sm font-bold text-slate-700">Affected area <span className="text-rose-500">*</span>
                <select name="category" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-blue-100">
                  <option>Login or account access</option>
                  <option>Customers</option>
                  <option>Invoices</option>
                  <option>Reminders or email</option>
                  <option>Payments</option>
                  <option>Something else</option>
                </select>
                <span className="mt-1.5 block text-xs font-normal text-slate-400">Choose the closest match so your report reaches the right context.</span>
              </label>

              <label className="block text-sm font-bold text-slate-700">What happened? <span className="text-rose-500">*</span>
                <textarea name="description" required minLength={10} rows={9} className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-normal leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-electric focus:ring-4 focus:ring-blue-100" placeholder={"Example: I was on the Invoice Data page and selected Import invoices. The file did not upload and I saw the message…\n\nI expected…\nWhat happened instead…"} />
                <span className="mt-1.5 block text-xs font-normal text-slate-400">Please include at least 10 characters. Avoid passwords, bank details and sensitive customer information.</span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <p className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="text-emerald-500" size={16} />Your account details will be attached securely.</p>
                <button className="inline-flex items-center rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700" type="submit"><Send className="mr-2" size={17} />Send support report</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </main>;
}

function SupportPoint({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><Icon className="mt-0.5 shrink-0 text-cyan-300" size={19} /><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-blue-100">{text}</p></div></div>;
}

function Issue({ icon: Icon, title, text, colour }: { icon: typeof ShieldCheck; title: string; text: string; colour: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${colour}`}><Icon size={17} /></span><div><p className="text-sm font-bold text-ink">{title}</p><p className="mt-0.5 text-xs text-slate-500">{text}</p></div></div>;
}

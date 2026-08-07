import Link from "next/link";
import { ArrowRight, CheckCircle2, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";

export const metadata = {
  title: "About CreditPilot AI | Our Founder and Story",
  description: "Discover why CreditPilot AI was created and how we are helping UK businesses take control of late payments.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <MarketingNav />
      <section className="relative overflow-hidden border-t border-slate-100 bg-sky px-6 py-20 lg:px-8 lg:py-28">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="eyebrow">The story behind CreditPilot AI</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">Built to make getting paid feel simpler.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">CreditPilot AI started with a practical observation: good businesses can lose valuable time and cash flow simply because following up on invoices is difficult to manage consistently.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow">Meet the founder</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Peter Ingham</h2>
          <p className="mt-1 font-semibold text-electric">Founder &amp; CEO, CreditPilot AI</p>
          <div className="mt-7 space-y-5 text-base leading-8 text-slate-600">
            <p>I created CreditPilot AI to help owners and finance teams spend less time chasing overdue invoices and more time running their businesses.</p>
            <p>The aim is not to replace good judgement or customer relationships. It is to give businesses a clear, reliable assistant that highlights what needs attention, prepares professional communication and keeps every promise, payment and next step in one place.</p>
            <p>Credit control should be proactive, understandable and human. That belief continues to guide every part of the product.</p>
          </div>
        </div>
        <aside className="rounded-2xl border border-blue-100 bg-sky p-7 shadow-card">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-electric text-white"><Lightbulb size={24} /></div>
          <h3 className="mt-6 text-xl font-bold">A simple mission</h3>
          <p className="mt-3 leading-7 text-slate-600">Help UK businesses improve cash flow while keeping every customer conversation professional and respectful.</p>
          <div className="mt-7 space-y-4 text-sm font-medium text-slate-700">
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-electric" size={18} />Clear actions instead of scattered spreadsheets</p>
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-electric" size={18} />AI support with owner approval and control</p>
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-electric" size={18} />Designed for real UK SME workflows</p>
          </div>
        </aside>
      </section>

      <section className="bg-ink px-6 py-20 text-white lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow text-blue-300">How it came about</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">From a daily pain point to a practical AI finance assistant.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[['01', 'The problem', 'Late invoices create pressure, even when the underlying business is healthy.'], ['02', 'The first workflow', 'A focused process for organising invoices, prioritising follow-ups and tracking promises.'], ['03', 'The product', 'A shared workspace for reminders, statements, collections and payment visibility.'], ['04', 'The direction', 'Responsible AI that recommends the next best action while people stay in control.']].map(([number, title, copy]) => <div key={number} className="border-l border-blue-400/40 pl-5"><span className="text-sm font-bold text-blue-300">{number}</span><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-blue-100">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"><Sparkles className="text-electric" size={23} /><h3 className="mt-5 font-bold">Useful AI</h3><p className="mt-2 text-sm leading-6 text-slate-600">Insights should lead to a clear action, not another report to interpret.</p></article>
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"><ShieldCheck className="text-electric" size={23} /><h3 className="mt-5 font-bold">Human control</h3><p className="mt-2 text-sm leading-6 text-slate-600">Businesses approve communications and remain responsible for their decisions.</p></article>
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"><Lightbulb className="text-electric" size={23} /><h3 className="mt-5 font-bold">Built with customers</h3><p className="mt-2 text-sm leading-6 text-slate-600">The roadmap is shaped by the real questions finance teams ask every day.</p></article>
        </div>
        <div className="mt-14 rounded-3xl bg-sky px-7 py-12 text-center sm:px-12"><h2 className="text-3xl font-bold tracking-tight">Ready to take control of your collections?</h2><p className="mx-auto mt-4 max-w-2xl text-slate-600">See how CreditPilot AI can fit into your team&apos;s workflow.</p><Link className="button-primary mt-7" href="/register">Get started <ArrowRight className="ml-2" size={17} /></Link></div>
      </section>
    </main>
  );
}

import { Bot, BrainCircuit, CheckCircle2, MessageSquareText, Search, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { analyseCustomerReply, askCopilot, generateCollectionIntelligence } from "./actions";

export const dynamic = "force-dynamic";
// Deployment retry after a transient database migration lock.

const suggestedQuestions = [
  "Who should I chase today?",
  "How much is overdue?",
  "What is due this week?",
  "Who owes the most?",
];

export default async function CopilotPage({ searchParams }: { searchParams: Promise<{ answer?: string; question?: string; error?: string; replyResult?: string; intelligence?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const params = await searchParams;

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Finance workspace</p>
        <h1 className="text-xl font-bold text-ink">Ask Finance AI</h1>
      </header>

      <div className="mx-auto max-w-6xl space-y-7 p-5 sm:p-8">
        <aside className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm leading-6 text-amber-950">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><ShieldCheck size={19} /></span>
          <div><strong>AI-assisted · you stay in control.</strong><span className="text-amber-900"> Review source records before acting. Copilot suggests priorities, wording and classifications but does not execute legal, credit or enforcement decisions.</span></div>
        </aside>

        {params.error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{params.error}</div>}

        <section className="relative isolate overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 text-ink shadow-lg shadow-blue-100/50 sm:p-7">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-200/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-100/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><BrainCircuit size={15} /> AI collection intelligence</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Generate today&apos;s action plan</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Review risk signals, missed promises, payment-plan guidance, reminder tone and follow-up priorities using your live workspace data.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-700">
                <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-2">Priority cases</span>
                <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-2">Promise alerts</span>
                <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-2">Recommended follow-ups</span>
              </div>
            </div>
            <form action={generateCollectionIntelligence}>
              <button className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-electric shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl" type="submit">Run AI review <Sparkles className="ml-2" size={18} /></button>
            </form>
          </div>

          {params.intelligence && <div className="relative mt-7 rounded-2xl border border-white/20 bg-white p-6 text-slate-700 shadow-xl">
            <p className="flex items-center gap-2 text-sm font-bold text-electric"><CheckCircle2 size={18} /> AI-generated action plan</p>
            <p className="mt-4 whitespace-pre-line leading-7">{params.intelligence}</p>
          </div>}
        </section>

        <section className="grid gap-7 lg:grid-cols-[1.08fr_.92fr]">
          <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-100 text-electric"><Search size={23} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-electric">Ask your workspace</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">Get a grounded finance answer</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Ask about invoices, customers, payments, reminders and collection priorities.</p>
              </div>
            </div>

            <form action={askCopilot} className="mt-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Bot className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                  <input name="question" required defaultValue={params.question} placeholder="Ask a question about your finances…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </div>
                <button className="button-primary justify-center whitespace-nowrap" type="submit">Ask Finance AI</button>
              </div>
            </form>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Popular questions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedQuestions.map(question => <form key={question} action={askCopilot}>
                  <input type="hidden" name="question" value={question} />
                  <button type="submit" className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100">{question}</button>
                </form>)}
              </div>
            </div>

            {params.answer && <div className="mt-7 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-electric"><WandSparkles size={18} /> Finance AI answer</p>
              {params.question && <p className="mt-3 text-sm font-semibold text-ink">“{params.question}”</p>}
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{params.answer}</p>
            </div>}
          </article>

          <article className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/60 p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700"><MessageSquareText size={23} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-700">Reply assistant</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">Analyse a customer reply</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Identify likely intent and receive a suggested next action and response.</p>
              </div>
            </div>

            <form action={analyseCustomerReply} className="mt-7 space-y-4">
              <textarea name="reply" required rows={7} placeholder="Paste the customer’s email here…" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              <button className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-800" type="submit">Analyse reply <MessageSquareText className="ml-2" size={17} /></button>
            </form>

            {params.replyResult && <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-bold text-violet-700"><CheckCircle2 size={18} /> Reply analysis</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{params.replyResult}</p>
            </div>}
          </article>
        </section>

        <p className="text-center text-xs leading-5 text-slate-500">Finance AI answers are grounded in the records available in your CreditPilot workspace. Always verify important information before contacting a customer.</p>
      </div>
    </div>
  </main>;
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { analyseCustomerReply, askCopilot, generateCollectionIntelligence } from "./actions";

export const dynamic = "force-dynamic";

export default async function CopilotPage({ searchParams }: { searchParams: Promise<{ answer?: string; question?: string; error?: string; replyResult?: string; intelligence?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const params = await searchParams;

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Finance workspace</p><h1 className="text-xl font-bold text-ink">Ask Finance AI</h1></header><div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
    <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>AI-assisted · human review required.</strong> Copilot suggests priorities, wording and classifications. Check source records before acting; it does not make or execute legal, credit or enforcement decisions.</aside>
    <section className="rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-card"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">AI collection intelligence</p><h2 className="mt-1 text-2xl font-bold text-ink">Generate today&apos;s action plan</h2><p className="mt-2 text-slate-600">Risk scoring, missed promises, payment-plan guidance, reminder tone and follow-up priorities from your live data.</p></div><form action={generateCollectionIntelligence}><button className="button-primary" type="submit">Run AI review</button></form></div>{params.intelligence ? <div className="mt-5 rounded-lg bg-white p-5"><p className="text-sm font-semibold text-electric">AI-generated review</p><p className="mt-2 whitespace-pre-line text-slate-700">{params.intelligence}</p></div> : null}</section>
    <section className="rounded-xl border bg-white p-6 shadow-card"><h2 className="text-2xl font-bold text-ink">Ask about your finances</h2><p className="mt-2 text-slate-600">Get a grounded answer from your invoice, customer, payment and reminder data.</p><form action={askCopilot} className="mt-6 flex gap-3"><input name="question" required defaultValue={params.question} placeholder="How much is due this week?" className="flex-1 rounded-lg border px-3 py-3" /><button className="button-primary" type="submit">Ask Finance AI</button></form>{params.answer ? <div className="mt-6 rounded-lg bg-sky p-5"><p className="text-sm font-semibold text-electric">Finance AI answer</p><p className="mt-2 whitespace-pre-line text-slate-700">{params.answer}</p></div> : null}<div className="mt-6 text-sm text-slate-500">Try: How much is overdue? · Who should I chase today? · What is due this week?</div></section>
    <section className="rounded-xl border bg-white p-6 shadow-card"><h2 className="text-xl font-bold text-ink">Analyse a customer reply</h2><p className="mt-2 text-slate-600">Paste a customer email to identify likely intent and get a suggested next action.</p><form action={analyseCustomerReply} className="mt-5 space-y-3"><textarea name="reply" required rows={5} placeholder="Example: We will pay the invoice on Friday. Sorry for the delay." className="w-full rounded-lg border px-3 py-3" /><button className="button-primary" type="submit">Analyse reply</button></form>{params.replyResult ? <div className="mt-5 rounded-lg bg-sky p-5"><p className="text-sm font-semibold text-electric">AI-generated reply analysis</p><p className="mt-2 whitespace-pre-line text-slate-700">{params.replyResult}</p></div> : null}</section>
  </div></div></main>;
}

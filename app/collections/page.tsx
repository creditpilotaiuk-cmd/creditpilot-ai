import Link from "next/link";
import { ArrowRight, CircleAlert, ClipboardList, PoundSterling, Sparkles, Upload, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { updateCollectionWorkflow } from "./actions";

export const dynamic = "force-dynamic";

const money = (value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

function collectionDecision(invoice: Awaited<ReturnType<typeof getCollectionCases>>[number], today: Date) {
  const amount = Number(invoice.amount);
  const daysOverdue = Math.max(0, Math.floor((today.getTime() - invoice.dueDate.getTime()) / 86_400_000));
  const missedPromise = invoice.paymentPromises.some(promise => promise.status === "BROKEN" || (promise.status === "OPEN" && promise.promisedFor < today));
  const openPromise = invoice.paymentPromises.find(promise => promise.status === "OPEN" && promise.promisedFor >= today);
  const lastReminder = invoice.reminders[0];
  const riskPoints = invoice.customer.riskLevel === "HIGH" ? 35 : invoice.customer.riskLevel === "MEDIUM" ? 15 : 0;
  const score = Math.min(100, Math.round(daysOverdue * 0.7 + Math.min(amount / 250, 30) + riskPoints + (missedPromise ? 35 : 0) + Math.min(invoice.reminders.length * 3, 12)));

  if (["DISPUTED", "ON_HOLD", "PAYMENT_PLAN", "LEGAL_ESCALATION", "WRITTEN_OFF"].includes(invoice.status)) {
    return { score, daysOverdue, missedPromise, openPromise, lastReminder, action: `Review ${invoice.status.replaceAll("_", " ").toLowerCase()} case`, chaseable: false };
  }
  if (missedPromise) return { score, daysOverdue, missedPromise, openPromise, lastReminder, action: "Follow up broken promise today", chaseable: true };
  if (openPromise) return { score, daysOverdue, missedPromise, openPromise, lastReminder, action: `Monitor promise due ${openPromise.promisedFor.toLocaleDateString("en-GB")}`, chaseable: false };
  if (!lastReminder) return { score, daysOverdue, missedPromise, openPromise, lastReminder, action: "Prepare first follow-up", chaseable: true };
  return { score, daysOverdue, missedPromise, openPromise, lastReminder, action: "Review history and choose next follow-up", chaseable: true };
}

async function getCollectionCases(companyId: string) {
  return prisma.invoice.findMany({
    where: { companyId, status: { not: "PAID" } },
    include: {
      customer: true,
      paymentPromises: { orderBy: { promisedFor: "desc" } },
      reminders: { orderBy: { createdAt: "desc" } },
      collectionOwner: true,
    },
  });
}

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const today = new Date();
  const [rawCases, team] = await Promise.all([
    getCollectionCases(user.companyId),
    prisma.user.findMany({ where: { companyId: user.companyId }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  const cases = rawCases.map(invoice => ({ invoice, decision: collectionDecision(invoice, today) })).sort((a, b) => b.decision.score - a.decision.score || Number(b.invoice.amount) - Number(a.invoice.amount));
  const actionCount = cases.filter(item => item.decision.chaseable).length;
  const brokenPromises = cases.filter(item => item.decision.missedPromise).length;
  const totalOpen = cases.reduce((sum, item) => sum + Number(item.invoice.amount), 0);
  const priorityCase = cases[0];

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Daily credit-control workspace</p>
        <h1 className="text-xl font-bold text-ink">Today&apos;s Chase List</h1>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <Summary icon={PoundSterling} label="Open balance" value={money(totalOpen)} tone="blue" helper={cases.length ? `Across ${cases.length} active case${cases.length === 1 ? "" : "s"}` : "No active balance"} />
          <Summary icon={ClipboardList} label="Actions to review" value={String(actionCount)} tone="violet" helper={actionCount ? "Ready for your attention" : "You are up to date"} />
          <Summary icon={CircleAlert} label="Missed promises" value={String(brokenPromises)} tone={brokenPromises > 0 ? "rose" : "emerald"} helper={brokenPromises ? "Follow up today" : "No broken promises"} highlight={brokenPromises > 0} />
        </section>

        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#10285f] via-[#1d4da5] to-[#2764ff] p-6 text-white shadow-[0_22px_55px_rgba(30,64,175,0.24)] sm:p-8">
          <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100"><Sparkles size={15} /> Recommended focus</span>
              <h2 className="mt-4 text-2xl font-bold">{priorityCase ? priorityCase.decision.action : "Bring in your invoices to build today’s priorities"}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">{priorityCase ? `${priorityCase.invoice.customer.name} · ${money(Number(priorityCase.invoice.amount))} · Priority Score ${priorityCase.decision.score}. Review the evidence and confirm the next action.` : "Import your invoice data and CreditPilot AI will organise open cases by overdue age, balance, recorded risk, chase history and broken promises."}</p>
            </div>
            <Link href={priorityCase ? "#priority-cases" : "/invoices"} className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-electric shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              {priorityCase ? "Review priority case" : "Import invoice data"} <ArrowRight className="ml-2" size={17} />
            </Link>
          </div>
        </section>

        <section id="priority-cases" className="scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/70 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">Prioritised collection cases</h2>
              <p className="mt-1 text-sm text-slate-500">{cases.length} open case{cases.length === 1 ? "" : "s"} · highest CreditPilot AI Priority Score first</p>
            </div>
            {cases.length > 0 && <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-800">Focus on the first action</span>}
          </div>

          {cases.length === 0 ? <div className="px-6 py-14 text-center sm:py-16">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 text-electric shadow-sm"><Upload size={28} /></span>
            <h3 className="mt-5 text-xl font-bold text-ink">Your chase list is ready for its first cases</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Import invoice data to create prioritised cases, or add customers first if you are setting up a new workspace.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/invoices" className="button-primary">Import invoices <ArrowRight className="ml-2" size={16} /></Link>
              <Link href="/customers" className="button-secondary">Add customers</Link>
            </div>
          </div> : <div className="divide-y divide-slate-100">
            {cases.map(({ invoice, decision }, index) => <article key={invoice.id} className={`grid gap-6 border-l-4 p-5 transition hover:bg-blue-50/30 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)] lg:items-center ${decision.score >= 70 ? "border-l-rose-500" : decision.score >= 40 ? "border-l-amber-400" : "border-l-blue-500"}`}>
              <div className="flex gap-4">
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-base font-bold shadow-sm ${decision.score >= 70 ? "bg-rose-100 text-rose-700" : decision.score >= 40 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-electric"}`}><span>{decision.score}</span></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{invoice.customer.name} · {invoice.number}</p>
                    {index === 0 && <span className="rounded-full bg-electric px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Next best action</span>}
                    {decision.missedPromise && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">Promise missed</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{money(Number(invoice.amount))} · {decision.daysOverdue} days overdue · {invoice.customer.riskLevel.toLowerCase()} recorded risk</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Recommended next action</p>
                  <p className="mt-1 text-sm font-bold text-electric">{decision.action}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{invoice.reminders.length} reminder{invoice.reminders.length === 1 ? "" : "s"}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{invoice.paymentPromises.length} promise record{invoice.paymentPromises.length === 1 ? "" : "s"}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{invoice.collectionOwner ? `Owned by ${invoice.collectionOwner.name || invoice.collectionOwner.email}` : "Unassigned"}</span>
                    {invoice.nextActionAt && <span className={`rounded-full px-2.5 py-1 ${invoice.nextActionAt < today && !invoice.nextActionCompletedAt ? "bg-rose-100 font-semibold text-rose-700" : "bg-slate-100"}`}>Next {invoice.nextActionAt.toLocaleDateString("en-GB")}</span>}
                  </div>
                </div>
              </div>

              <form action={updateCollectionWorkflow} className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2">
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <label className="text-xs font-semibold text-slate-600">Owner
                  <select name="ownerId" defaultValue={invoice.collectionOwnerId || ""} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Unassigned</option>
                    {team.map(member => <option key={member.id} value={member.id}>{member.name || member.email}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600">Next-action date
                  <input name="nextActionAt" type="date" defaultValue={invoice.nextActionAt?.toISOString().slice(0, 10) || ""} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Team next action
                  <input name="nextAction" defaultValue={invoice.nextAction || decision.action} placeholder="Call accounts contact" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600"><input name="completed" type="checkbox" defaultChecked={Boolean(invoice.nextActionCompletedAt)} className="h-4 w-4 accent-blue-600" />Mark action complete</label>
                <button className="button-primary" type="submit">Save action</button>
              </form>
            </article>)}
          </div>}
        </section>

        <p className="text-xs leading-5 text-slate-500">CreditPilot AI Priority Scores are operational guidance based only on information recorded in this workspace. They are not credit ratings or legal advice.</p>
      </div>
    </div>
  </main>;
}

const summaryTones = {
  blue: { shell: "border-blue-100 bg-gradient-to-br from-white to-blue-50", icon: "bg-blue-100 text-blue-700", value: "text-blue-950" },
  violet: { shell: "border-violet-100 bg-gradient-to-br from-white to-violet-50", icon: "bg-violet-100 text-violet-700", value: "text-violet-950" },
  rose: { shell: "border-rose-200 bg-gradient-to-br from-white to-rose-50", icon: "bg-rose-100 text-rose-700", value: "text-rose-700" },
  emerald: { shell: "border-emerald-100 bg-gradient-to-br from-white to-emerald-50", icon: "bg-emerald-100 text-emerald-700", value: "text-emerald-950" },
};

function Summary({ icon: Icon, label, value, helper, tone, highlight = false }: { icon: LucideIcon; label: string; value: string; helper: string; tone: keyof typeof summaryTones; highlight?: boolean }) {
  const colours = summaryTones[tone];
  return <div className={`group relative overflow-hidden rounded-2xl border p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${colours.shell} ${highlight ? "ring-2 ring-rose-200" : ""}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className={`mt-2 text-3xl font-bold tracking-tight ${colours.value}`}>{value}</p>
        <p className="mt-2 text-xs font-medium text-slate-500">{helper}</p>
      </div>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition group-hover:scale-110 ${colours.icon}`}><Icon size={21} /></span>
    </div>
  </div>;
}

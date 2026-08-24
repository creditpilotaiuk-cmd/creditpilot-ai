import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { updateInvoiceStatus } from "@/app/invoices/actions";

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
    },
  });
}

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const today = new Date();
  const cases = (await getCollectionCases(user.companyId)).map(invoice => ({ invoice, decision: collectionDecision(invoice, today) })).sort((a, b) => b.decision.score - a.decision.score || Number(b.invoice.amount) - Number(a.invoice.amount));
  const actionCount = cases.filter(item => item.decision.chaseable).length;
  const brokenPromises = cases.filter(item => item.decision.missedPromise).length;
  const totalOpen = cases.reduce((sum, item) => sum + Number(item.invoice.amount), 0);

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Daily collection workspace</p><h1 className="text-xl font-bold text-ink">Collections control centre</h1></header><div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
    <section className="grid gap-4 sm:grid-cols-3"><Summary label="Open balance" value={money(totalOpen)} /><Summary label="Actions to review" value={String(actionCount)} /><Summary label="Missed promises" value={String(brokenPromises)} alert={brokenPromises > 0} /></section>
    <div className="rounded-xl border border-blue-100 bg-sky p-5"><h2 className="font-bold text-ink">Start with the reason, not just the oldest invoice</h2><p className="mt-1 text-sm leading-6 text-slate-600">Cases are ranked using overdue age, balance, recorded customer risk, reminder history and missed payment promises. The score supports your judgement; CreditPilot never sends or escalates without your approval.</p></div>
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="border-b p-5"><h2 className="font-bold text-ink">Prioritised collection cases</h2><p className="mt-1 text-sm text-slate-500">{cases.length} open invoice{cases.length === 1 ? "" : "s"}, highest attention score first.</p></div>{cases.length === 0 ? <p className="p-8 text-sm text-slate-500">No open cases.</p> : <div className="divide-y">{cases.map(({ invoice, decision }) => <article key={invoice.id} className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)] lg:items-center"><div className="flex gap-4"><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold ${decision.score >= 70 ? "bg-rose-50 text-rose-700" : decision.score >= 40 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-electric"}`}><span>{decision.score}</span></div><div><p className="font-semibold text-ink">{invoice.customer.name} · {invoice.number}</p><p className="mt-1 text-sm text-slate-600">{money(Number(invoice.amount))} · {decision.daysOverdue} days overdue · {invoice.customer.riskLevel.toLowerCase()} recorded risk</p><p className="mt-2 text-sm font-semibold text-electric">{decision.action}</p><div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500"><span>{invoice.reminders.length} reminder{invoice.reminders.length === 1 ? "" : "s"}</span><span>•</span><span>{invoice.paymentPromises.length} promise record{invoice.paymentPromises.length === 1 ? "" : "s"}</span>{decision.missedPromise && <><span>•</span><span className="font-semibold text-rose-700">Promise missed</span></>}</div></div></div><form action={updateInvoiceStatus} className="flex flex-wrap items-center gap-2 lg:justify-end"><input type="hidden" name="invoiceId" value={invoice.id} /><select aria-label={`Collection status for ${invoice.number}`} name="status" defaultValue={invoice.status} className="rounded-lg border px-3 py-2 text-sm"><option value="OVERDUE">Overdue</option><option value="ON_HOLD">Put on hold</option><option value="DISPUTED">Disputed</option><option value="PAYMENT_PLAN">Payment plan</option><option value="LEGAL_ESCALATION">Legal escalation</option><option value="WRITTEN_OFF">Written off</option><option value="PAID">Paid</option></select><input aria-label={`Reason for ${invoice.number}`} name="reason" placeholder="Reason (optional)" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm lg:max-w-44" /><button className="button-primary" type="submit">Save case</button></form></article>)}</div>}</section>
    <p className="text-xs leading-5 text-slate-500">Attention scores are operational guidance based only on information recorded in CreditPilot. They are not credit ratings or legal advice.</p>
  </div></div></main>;
}

function Summary({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-card"><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 text-2xl font-bold ${alert ? "text-rose-700" : "text-ink"}`}>{value}</p></div>;
}

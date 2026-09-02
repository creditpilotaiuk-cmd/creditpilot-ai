import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, CircleDollarSign, Clock3, FileText, Mail, MessageSquareText, Phone, PhoneCall, ShieldCheck, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { logPhoneCall } from "./actions";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  INVOICE_UPLOADED: "Invoice uploaded", INVOICE_SENT: "Invoice sent", REMINDER_GENERATED: "Reminder generated",
  REMINDER_EDITED: "Reminder edited", REMINDER_APPROVED: "Reminder approved", REMINDER_SENT: "Reminder sent",
  DELIVERY_CONFIRMED: "Delivery confirmed", EMAIL_OPENED: "Email opened", PAYMENT_PROMISE: "Payment promise set up",
  PROMISE_BROKEN: "Broken payment promise", PAYMENT_RECEIVED: "Payment received", STATEMENT_SENT: "Statement sent",
  DISPUTE_RAISED: "Account in dispute", PHONE_CALL_LOGGED: "Phone call logged",
};

function value(input: unknown) {
  if (input === null || input === undefined) return "Not recorded";
  if (typeof input === "string") return input;
  return JSON.stringify(input, null, 2);
}

export default async function CommunicationHistoryPage({ params, searchParams }: { params: Promise<{ customerId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const { customerId } = await params;
  const query = await searchParams;
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId: user.companyId },
    include: { invoices: { select: { id: true } } },
  });
  if (!customer) redirect("/customers");

  const invoiceIds = customer.invoices.map(invoice => invoice.id);
  const events = await prisma.auditEvent.findMany({
    where: { companyId: user.companyId, OR: [{ entity: "Customer", entityId: customer.id }, { entity: "Invoice", entityId: { in: invoiceIds } }] },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const communicationCount = events.filter(event => ["REMINDER_SENT", "STATEMENT_SENT", "EMAIL_OPENED", "DELIVERY_CONFIRMED", "PHONE_CALL_LOGGED"].includes(event.action)).length;
  const paymentCount = events.filter(event => ["PAYMENT_PROMISE", "PAYMENT_RECEIVED"].includes(event.action)).length;
  const attentionCount = events.filter(event => ["PROMISE_BROKEN", "DISPUTE_RAISED"].includes(event.action)).length;
  const latestEvent = events[0];

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Customer account</p>
        <h1 className="text-xl font-bold text-ink">Communication history</h1>
      </header>

      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <Link href="/communications" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric">
          <ArrowLeft size={16} />Back to collection timelines
        </Link>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><ShieldCheck size={14} />Authorised account record</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">{customer.name}</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">A complete, chronological record of customer communications, payment activity and collection decisions.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold text-blue-100">Latest activity</p>
              <p className="mt-1 font-bold">{latestEvent ? latestEvent.createdAt.toLocaleDateString("en-GB") : "No activity yet"}</p>
            </div>
          </div>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-4">
            <Metric icon={FileText} label="Invoices" value={customer.invoices.length} colour="text-cyan-300" />
            <Metric icon={MessageSquareText} label="Communications" value={communicationCount} colour="text-blue-200" />
            <Metric icon={CircleDollarSign} label="Payment events" value={paymentCount} colour="text-emerald-300" />
            <Metric icon={AlertTriangle} label="Needs attention" value={attentionCount} colour="text-amber-300" />
          </div>
        </section>

        {query.call === "1" && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={19} />Phone call added to the communication history.</div>}

        <section className="mt-7 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-slate-200/60">
          <div className="grid lg:grid-cols-[.7fr_1.3fr]">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-md"><PhoneCall size={21} /></div>
              <h2 className="mt-4 text-xl font-bold text-ink">Log a phone call</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Record the direction, outcome and agreed next action while the details are fresh.</p>
            </div>
            <form action={logPhoneCall} className="grid content-center gap-4 p-6 sm:grid-cols-[170px_1fr_auto]">
              <input type="hidden" name="customerId" value={customer.id} />
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Call direction
                <select name="direction" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-ink focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"><option>Outbound</option><option>Inbound</option></select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Outcome and next action
                <input name="outcome" required minLength={3} placeholder="e.g. Payment promised for Friday" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100" />
              </label>
              <button className="button-primary self-end whitespace-nowrap" type="submit"><Phone size={16} className="mr-2" />Log call</button>
            </form>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Account evidence</p><h2 className="mt-1 text-xl font-bold text-ink">Activity timeline</h2><p className="mt-1 text-sm text-slate-500">{events.length} recorded account event{events.length === 1 ? "" : "s"}, newest first.</p></div>
            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">Complete audit history</span>
          </div>

          {events.length === 0 ? <div className="p-12 text-center"><Clock3 className="mx-auto text-slate-300" size={34} /><p className="mt-4 font-bold text-ink">No activity recorded yet</p><p className="mt-1 text-sm text-slate-500">Calls, reminders and payment events will appear here.</p></div> :
          <div className="p-5 sm:p-6">{events.map(event => {
            const metadata = (event.metadata || {}) as Record<string, unknown>;
            const finalDemand = event.action === "REMINDER_SENT" && (metadata.newValue as Record<string, unknown> | undefined)?.stage === 3;
            const visual = eventVisual(event.action);
            const Icon = visual.icon;
            return <article key={event.id} className="relative grid grid-cols-[42px_1fr] gap-4 pb-7 last:pb-0">
              <div className="absolute bottom-0 left-5 top-10 w-px bg-slate-200 last:hidden" />
              <div className={`relative z-10 grid h-10 w-10 place-items-center rounded-xl ${visual.iconClass}`}><Icon size={18} /></div>
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:border-blue-200 hover:shadow-md sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><h3 className="font-bold text-ink">{finalDemand ? "Final demand issued" : labels[event.action] || event.action.replaceAll("_", " ").toLowerCase()}</h3><p className="mt-1 text-sm text-slate-500">Recorded by {event.user?.name || event.user?.email || String(metadata.submittedBy || "System")}</p></div>
                  <time className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{event.createdAt.toLocaleString("en-GB")}</time>
                </div>
                <details className="group mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-bold text-slate-600">View event evidence<ChevronDown size={16} className="transition group-open:rotate-180" /></summary>
                  <dl className="grid gap-4 border-t bg-slate-50/70 p-4 text-xs sm:grid-cols-2">
                    <Detail label="Previous value" content={value(metadata.previousValue)} />
                    <Detail label="New value" content={value(metadata.newValue)} />
                    <Detail label="Reason" content={value(metadata.reason)} />
                    <Detail label="IP address" content={value(metadata.ipAddress)} />
                  </dl>
                </details>
              </div>
            </article>;
          })}</div>}
        </section>
      </div>
    </div>
  </main>;
}

function Metric({ icon: Icon, label, value, colour }: { icon: LucideIcon; label: string; value: number; colour: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><div className={`flex items-center gap-2 ${colour}`}><Icon size={18} /><span className="text-2xl font-bold text-white">{value}</span></div><p className="mt-1 text-xs font-semibold text-blue-100">{label}</p></div>;
}

function Detail({ label, content }: { label: string; content: string }) {
  return <div className="min-w-0"><dt className="font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words font-medium leading-5 text-slate-700">{content}</dd></div>;
}

function eventVisual(action: string): { icon: LucideIcon; iconClass: string } {
  if (action === "PAYMENT_RECEIVED") return { icon: CircleDollarSign, iconClass: "bg-emerald-100 text-emerald-700" };
  if (action === "PROMISE_BROKEN" || action === "DISPUTE_RAISED") return { icon: AlertTriangle, iconClass: "bg-amber-100 text-amber-700" };
  if (action === "PHONE_CALL_LOGGED") return { icon: Phone, iconClass: "bg-violet-100 text-violet-700" };
  if (action.includes("REMINDER") || action.includes("EMAIL") || action === "STATEMENT_SENT") return { icon: Mail, iconClass: "bg-blue-100 text-blue-700" };
  return { icon: FileText, iconClass: "bg-slate-100 text-slate-700" };
}

import Link from "next/link";
import { ArrowLeft, MessageSquareText, Phone } from "lucide-react";
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

function value(input: unknown) { return input === null || input === undefined ? "—" : typeof input === "string" ? input : JSON.stringify(input); }

export default async function CommunicationHistoryPage({ params, searchParams }: { params: Promise<{ customerId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const { customerId } = await params;
  const query = await searchParams;
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId }, include: { invoices: { select: { id: true } } } });
  if (!customer) redirect("/customers");
  const invoiceIds = customer.invoices.map(invoice => invoice.id);
  const events = await prisma.auditEvent.findMany({ where: { companyId: user.companyId, OR: [{ entity: "Customer", entityId: customer.id }, { entity: "Invoice", entityId: { in: invoiceIds } }] }, include: { user: true }, orderBy: { createdAt: "desc" } });

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Customer account</p><h1 className="text-xl font-bold text-ink">Communication history</h1></header><div className="mx-auto max-w-5xl p-5 sm:p-8"><Link href="/customers" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} />Back to customers</Link>
    <section className="rounded-xl border border-blue-100 bg-sky p-5"><div className="flex gap-3"><MessageSquareText className="shrink-0 text-electric" size={22} /><div><h2 className="font-bold text-ink">{customer.name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">A complete history of communications and account activity for this customer. Records are isolated to this customer and can only be viewed by authorised users in your company.</p></div></div></section>
    {query.call === "1" && <p className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Phone call added to the communication history.</p>}
    <section className="mt-6 rounded-xl border bg-white p-6 shadow-card"><div className="flex items-center gap-2"><Phone size={18} className="text-electric" /><h2 className="font-bold text-ink">Log a phone call</h2></div><form action={logPhoneCall} className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto]"><input type="hidden" name="customerId" value={customer.id} /><select name="direction" className="rounded-lg border px-3 py-2 text-sm"><option>Outbound</option><option>Inbound</option></select><input name="outcome" required minLength={3} placeholder="Call outcome and next action" className="rounded-lg border px-3 py-2 text-sm" /><button className="button-secondary" type="submit">Log call</button></form></section>
    <section className="mt-6 overflow-hidden rounded-xl border bg-white shadow-card"><div className="border-b p-5"><h2 className="font-bold text-ink">Communication history</h2><p className="mt-1 text-sm text-slate-500">{events.length} recorded account event{events.length === 1 ? "" : "s"}.</p></div>{events.length === 0 ? <p className="p-6 text-sm text-slate-500">No communications recorded yet.</p> : <div className="divide-y">{events.map(event => { const metadata = (event.metadata || {}) as Record<string, unknown>; const finalDemand = event.action === "REMINDER_SENT" && (metadata.newValue as Record<string, unknown> | undefined)?.stage === 3; return <article key={event.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-ink">{finalDemand ? "Final demand issued" : labels[event.action] || event.action.replaceAll("_", " ").toLowerCase()}</h3><time className="text-xs text-slate-500">{event.createdAt.toLocaleString("en-GB")}</time></div><p className="mt-1 text-sm text-slate-500">By {event.user?.name || event.user?.email || String(metadata.submittedBy || "System")}</p><details className="mt-3 rounded-lg bg-slate-50"><summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-600">Event details</summary><dl className="grid gap-2 border-t px-3 py-3 text-xs sm:grid-cols-2"><div><dt className="font-semibold">Previous value</dt><dd>{value(metadata.previousValue)}</dd></div><div><dt className="font-semibold">New value</dt><dd>{value(metadata.newValue)}</dd></div><div><dt className="font-semibold">IP address</dt><dd>{value(metadata.ipAddress)}</dd></div><div><dt className="font-semibold">Reason</dt><dd>{value(metadata.reason)}</dd></div></dl></details></article>})}</div>}</section>
  </div></div></main>;
}

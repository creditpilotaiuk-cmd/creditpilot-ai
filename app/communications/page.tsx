import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDollarSign, Clock3, FileText, Mail, MessageSquareText, PhoneCall, Scale, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function CommunicationsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { companyId: user.companyId },
    include: { _count: { select: { invoices: true } } },
    orderBy: { name: "asc" },
  });

  const totalInvoices = customers.reduce((total, customer) => total + customer._count.invoices, 0);
  const contactableCustomers = customers.filter((customer) => customer.email).length;

  return <main className="flex min-h-screen">
    <DashboardSidebar />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-5 py-4 sm:px-8">
        <p className="text-sm text-slate-500">Credit control workspace</p>
        <h1 className="text-xl font-bold text-ink">Collection timeline</h1>
      </header>

      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-electric">
          <ArrowLeft size={16} />Back to dashboard
        </Link>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07183f] via-[#123d91] to-[#2867f0] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                <MessageSquareText size={14} />Complete account history
              </span>
              <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">Every collection decision, in one clear timeline.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Open a customer record to review reminders, promises, payments, disputes, ownership decisions and logged calls in chronological order.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><Mail size={13} />Chases</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><Clock3 size={13} />Promises</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><CircleDollarSign size={13} />Payments</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><Scale size={13} />Disputes</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><PhoneCall size={13} />Calls</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><ShieldCheck size={13} />Decisions</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <Summary label="Customers" value={customers.length} icon={<Users size={18} />} />
              <Summary label="Invoices tracked" value={totalInvoices} icon={<FileText size={18} />} />
              <Summary label="Email ready" value={contactableCustomers} icon={<CheckCircle2 size={18} />} />
            </div>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b bg-gradient-to-r from-white to-blue-50/70 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric">Customer records</p>
              <h2 className="mt-1 text-xl font-bold text-ink">Choose a timeline</h2>
              <p className="mt-1 text-sm text-slate-500">{customers.length} customer{customers.length === 1 ? "" : "s"} available.</p>
            </div>
            <div className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">Newest activity appears first</div>
          </div>

          {customers.length === 0 ? <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-electric"><Users size={26} /></div>
            <p className="mt-4 font-bold text-ink">No customer timelines yet</p>
            <p className="mt-1 text-sm text-slate-500">Add a customer to begin building a complete collection history.</p>
            <Link href="/customers" className="button-primary mt-5 inline-flex">Add a customer</Link>
          </div> : <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            {customers.map((customer, index) => <Link
              key={customer.id}
              href={`/customers/${customer.id}/communication-history`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-50 transition group-hover:bg-blue-100" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-md">
                  {customer.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">{customer._count.invoices} invoice{customer._count.invoices === 1 ? "" : "s"}</span>
              </div>
              <h3 className="relative mt-4 text-lg font-bold text-ink">{customer.name}</h3>
              <p className="relative mt-1 flex items-center gap-2 text-sm text-slate-500"><Mail size={14} />{customer.email || "Email address not recorded"}</p>
              <div className="relative mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs font-semibold text-slate-500">{index === 0 ? "Ready to review" : "Full account history"}</span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-electric">Open timeline <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>)}
          </div>}
        </section>
      </div>
    </div>
  </main>;
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
    <div className="flex items-center gap-2 text-cyan-200">{icon}<span className="text-xl font-bold text-white">{value}</span></div>
    <p className="mt-1 text-[11px] font-semibold text-blue-100">{label}</p>
  </div>;
}

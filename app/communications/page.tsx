import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
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
  const customers = await prisma.customer.findMany({ where: { companyId: user.companyId }, include: { _count: { select: { invoices: true } } }, orderBy: { name: "asc" } });

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold text-ink">Communication history</h1></header><div className="mx-auto max-w-5xl p-5 sm:p-8"><Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} />Back to dashboard</Link>
    <section className="rounded-xl border border-blue-100 bg-sky p-5"><div className="flex gap-3"><MessageSquareText className="shrink-0 text-electric" size={22} /><div><h2 className="font-bold text-ink">Customer communications</h2><p className="mt-1 text-sm text-slate-600">Select a customer to view their isolated account history, including reminders, invoices, payments, statements, disputes and logged calls.</p></div></div></section>
    <section className="mt-6 overflow-hidden rounded-xl border bg-white shadow-card"><div className="border-b p-5"><h2 className="font-bold text-ink">Choose a customer</h2><p className="mt-1 text-sm text-slate-500">{customers.length} customer{customers.length === 1 ? "" : "s"} available.</p></div>{customers.length === 0 ? <p className="p-8 text-sm text-slate-500">Add a customer before viewing communication history.</p> : <div className="divide-y">{customers.map(customer => <Link key={customer.id} href={`/customers/${customer.id}/communication-history`} className="flex items-center justify-between gap-4 p-5 hover:bg-sky"><span><span className="block font-semibold text-ink">{customer.name}</span><span className="mt-1 block text-sm text-slate-500">{customer.email || "No email address"} · {customer._count.invoices} invoice{customer._count.invoices === 1 ? "" : "s"}</span></span><span className="text-sm font-semibold text-electric">Open history →</span></Link>)}</div>}</section>
  </div></div></main>;
}

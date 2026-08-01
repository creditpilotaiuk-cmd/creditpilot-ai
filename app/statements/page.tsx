import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function StatementsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customers = await prisma.customer.findMany({ where: { companyId: user.companyId }, orderBy: { name: "asc" } });
  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Customer statements</h1></header><div className="mx-auto max-w-4xl p-5 sm:p-8"><Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link><section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="border-b p-5"><h2 className="font-bold text-ink">Choose a customer</h2><p className="mt-1 text-sm text-slate-500">Open a printable statement of outstanding invoices.</p></div>{customers.length === 0 ? <p className="p-8 text-sm text-slate-500">Add a customer first.</p> : <div className="divide-y">{customers.map((customer) => <Link key={customer.id} href={`/statements/${customer.id}`} className="flex items-center justify-between p-5 hover:bg-sky"><span><span className="block font-semibold text-ink">{customer.name}</span><span className="text-sm text-slate-500">{customer.email || "No email address"}</span></span><FileText size={18} className="text-electric" /></Link>)}</div>}</section></div></div></main>;
}

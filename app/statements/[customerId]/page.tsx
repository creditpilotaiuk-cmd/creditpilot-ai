import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { StatementEmailForm } from "@/components/statement-email-form";

export const dynamic = "force-dynamic";

export default async function StatementPage({ params }: { params: Promise<{ customerId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const { customerId } = await params;
  const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId: user.companyId }, include: { invoices: { where: { status: { not: "PAID" } }, orderBy: { dueDate: "asc" } } } });
  if (!customer) redirect("/customers");
  const total = customer.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  return <main className="flex min-h-screen print:block"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8 print:hidden"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Customer statement</h1></header><div className="mx-auto max-w-4xl p-5 sm:p-8"><div className="mb-6 flex items-center justify-between print:hidden"><Link href="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-electric"><ArrowLeft size={16} />Back to customers</Link><span className="text-sm text-slate-500">Use your browser&apos;s Print option to save as PDF.</span></div><section className="rounded-xl border border-slate-100 bg-white p-6 shadow-card print:border-0 print:shadow-none"><div className="flex items-start justify-between gap-6 border-b pb-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-electric">CreditPilot AI</p><h2 className="mt-2 text-2xl font-bold text-ink">Statement of account</h2><p className="mt-2 text-sm text-slate-500">Issued {new Date().toLocaleDateString("en-GB")}</p></div><div className="text-right"><p className="font-bold text-ink">{customer.name}</p><p className="text-sm text-slate-500">{customer.email || "No email address"}</p></div></div><div className="mt-6 overflow-hidden rounded-lg border"><div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Invoice</span><span>Due date</span><span>Status</span><span className="text-right">Amount</span></div>{customer.invoices.length === 0 ? <p className="p-6 text-sm text-slate-500">No outstanding invoices.</p> : customer.invoices.map((invoice) => <div key={invoice.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-t px-4 py-4 text-sm"><span className="font-semibold text-ink">{invoice.number}</span><span>{invoice.dueDate.toLocaleDateString("en-GB")}</span><span className={invoice.status === "OVERDUE" ? "font-semibold text-red-600" : "text-slate-600"}>{invoice.status.toLowerCase()}</span><span className="text-right font-semibold">£{Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span></div>)}</div><div className="mt-6 flex justify-end"><div className="rounded-lg bg-sky px-6 py-4 text-right"><p className="text-sm text-slate-600">Total outstanding</p><p className="mt-1 text-2xl font-bold text-ink">£{total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p></div></div><p className="mt-8 text-xs text-slate-500">Please quote the invoice number when making payment. Contact us if any details on this statement are incorrect.</p></section></div></div></main>;
}

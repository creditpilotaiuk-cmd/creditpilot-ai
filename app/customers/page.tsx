import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { createCustomer } from "./actions";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const customers = await prisma.customer.findMany({ where: { companyId: user.companyId }, orderBy: { name: "asc" } });
  const params = await searchParams;

  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Credit control workspace</p><h1 className="text-xl font-bold tracking-tight text-ink">Customers</h1></header><div className="mx-auto max-w-7xl p-5 sm:p-8"><Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-electric"><ArrowLeft size={16} />Back to dashboard</Link><div className="grid gap-6 xl:grid-cols-[1fr_360px]">
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold text-ink">Your customers</h2><p className="mt-1 text-sm text-slate-500">{customers.length} customer{customers.length === 1 ? "" : "s"} in your workspace.</p></div><Users className="text-electric" size={20} /></div>{customers.length === 0 ? <div className="p-12 text-center"><Users className="mx-auto text-slate-300" size={35} /><p className="mt-4 font-semibold text-ink">No customers yet</p></div> : <div className="divide-y">{customers.map(customer => <div key={customer.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-ink">{customer.name}</p><p className="mt-1 text-sm text-slate-500">{customer.email ?? "No email added"}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{customer.riskLevel.toLowerCase()} risk</span></div>)}</div>}</section>
    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-card"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-electric text-white"><Plus size={18} /></span><h2 className="font-bold text-ink">Add a customer</h2></div>{params.created === "1" && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Customer added successfully.</p>}{params.error === "name" && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Please enter a customer name.</p>}<form action={createCustomer} className="mt-5 space-y-4"><Field name="name" label="Customer name" placeholder="ABC Construction" required /><Field name="contactName" label="Contact name" placeholder="Alex Brown" /><Field name="email" label="Email address" placeholder="accounts@customer.co.uk" type="email" /><Field name="phone" label="Phone number" placeholder="020 1234 5678" /><button className="button-primary w-full" type="submit">Add customer</button></form></section>
  </div></div></div></main>;
}

function Field({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" /></label>; }

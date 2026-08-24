import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requestCancellation } from "./actions";

export const dynamic = "force-dynamic";

const plans = [
  { name: "Starter", price: "£49", description: "For small teams building a consistent credit-control process.", features: ["Up to 150 active invoices", "Prioritised collection cases", "Three-stage reminders", "Customer statements"] },
  { name: "Growth", price: "£129", description: "For growing businesses managing a busier debtor book.", features: ["Up to 750 active invoices", "Everything in Starter", "Payment-promise tracking", "Dispute and case controls"], featured: true },
  { name: "Professional", price: "£249", description: "For larger teams needing deeper control and evidence.", features: ["Up to 2,500 active invoices", "Everything in Growth", "Collection history", "Evidence-pack exports"] },
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Account and billing</p><h1 className="text-xl font-bold text-ink">Membership</h1></header>
        <div className="mx-auto max-w-6xl p-5 sm:p-8">
          <Link href="/settings" className="text-sm font-semibold text-slate-500">← Back to settings</Link>
          {params.success && <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Checkout complete. Your account will update once payment is confirmed.</p>}
          <section className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 shadow-card sm:p-9">
            <p className="eyebrow">Founding beta access</p><h2 className="mt-3 text-3xl font-bold text-ink">Free access throughout the beta</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">Use every currently available collection feature while we validate the workflows with UK businesses. No subscription charge will be made, no card is required and no paid plan will begin automatically.</p>
          </section>
          <section className="mt-8">
            <div className="max-w-3xl"><p className="eyebrow">After the beta</p><h2 className="mt-2 text-2xl font-bold text-ink">Simple monthly plans when you choose to continue</h2><p className="mt-3 leading-7 text-slate-600">These are the planned post-beta prices. We will give you clear notice before billing begins, and you will actively choose a plan.</p></div>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <article key={plan.name} className={`flex flex-col rounded-2xl border bg-white p-6 shadow-card ${plan.featured ? "border-electric ring-2 ring-electric/10" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-ink">{plan.name}</h3>{plan.featured && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-electric">Most popular</span>}</div>
                  <p className="mt-5 text-4xl font-bold text-ink">{plan.price}<span className="text-sm font-medium text-slate-500"> / month</span></p>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
                  <button type="button" disabled className="mt-7 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">Available after beta</button>
                </article>
              ))}
            </div>
          </section>
          <section className="mt-8 rounded-xl border border-rose-100 bg-rose-50 p-6"><h3 className="font-bold text-ink">Need to cancel?</h3><p className="mt-2 max-w-2xl text-sm text-slate-600">Your data is not deleted immediately. Submit a request and we’ll confirm the cancellation.</p><form action={requestCancellation} className="mt-4"><button className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700" type="submit">Request cancellation</button></form></section>
        </div>
      </div>
    </main>
  );
}

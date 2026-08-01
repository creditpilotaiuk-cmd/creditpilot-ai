import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requestCancellation } from "./actions";
import { CheckoutButton } from "./checkout-button";

export const dynamic = "force-dynamic";
const plans = [
  { name: "Starter", price: "£79", description: "For small teams getting control of overdue invoices.", features: ["Up to 100 invoices", "Three-stage reminders", "Customer statements", "Email support"] },
  { name: "Growth", price: "£199", description: "For growing businesses with a busy finance function.", features: ["Up to 500 invoices", "Risk prioritisation", "Payment promises", "Priority support"] },
  { name: "Professional", price: "£399", description: "For teams that want deeper automation and reporting.", features: ["Everything in Growth", "Advanced reports", "Multiple team members", "Dedicated onboarding"] },
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const params = await searchParams;
  const current = user.company.plan === "BETA" ? "Starter" : user.company.plan;
  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Account and billing</p><h1 className="text-xl font-bold text-ink">Membership</h1></header><div className="mx-auto max-w-6xl p-5 sm:p-8"><Link href="/settings" className="text-sm font-semibold text-slate-500">← Back to settings</Link>{params.success && <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Checkout complete. Your plan will update once payment is confirmed.</p>}{params.cancelled_checkout && <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-700">Checkout was cancelled.</p>}<div className="mt-6"><p className="eyebrow">Simple, transparent pricing</p><h2 className="mt-1 text-3xl font-bold text-ink">Choose the right plan for your business</h2><p className="mt-2 text-slate-600">You are currently on the <strong>{current}</strong> plan.</p></div><section className="mt-7 grid gap-5 lg:grid-cols-3">{plans.map(plan => <div key={plan.name} className={`rounded-xl border bg-white p-6 shadow-card ${plan.name === current ? "border-electric ring-2 ring-blue-100" : ""}`}><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-ink">{plan.name}</h3>{plan.name === current && <span className="rounded-full bg-sky px-3 py-1 text-xs font-semibold text-electric">Current plan</span>}</div><p className="mt-4 text-3xl font-bold text-ink">{plan.price}<span className="text-sm font-normal text-slate-500"> / month</span></p><p className="mt-3 min-h-12 text-sm text-slate-600">{plan.description}</p><ul className="mt-5 space-y-3 text-sm text-slate-700">{plan.features.map(f => <li key={f}>✓ {f}</li>)}</ul><div className="mt-6">{plan.name === current ? <button className="button-secondary w-full" disabled>Current plan</button> : <CheckoutButton plan={plan.name} />}</div></div>)}</section><section className="mt-8 rounded-xl border border-rose-100 bg-rose-50 p-6"><h3 className="font-bold text-ink">Need to cancel?</h3><p className="mt-2 max-w-2xl text-sm text-slate-600">Your data is not deleted immediately. Submit a request and we’ll confirm the cancellation.</p><form action={requestCancellation} className="mt-4"><button className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700" type="submit">Request cancellation</button></form></section></div></div></main>;
}

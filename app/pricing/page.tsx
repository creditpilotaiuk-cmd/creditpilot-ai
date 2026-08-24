import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requestCancellation } from "./actions";

export const dynamic = "force-dynamic";
export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { company: true } });
  if (!user) redirect("/login");
  const params = await searchParams;
  return <main className="flex min-h-screen"><DashboardSidebar /><div className="min-w-0 flex-1"><header className="border-b bg-white px-5 py-4 sm:px-8"><p className="text-sm text-slate-500">Account and billing</p><h1 className="text-xl font-bold text-ink">Membership</h1></header><div className="mx-auto max-w-4xl p-5 sm:p-8"><Link href="/settings" className="text-sm font-semibold text-slate-500">← Back to settings</Link>{params.success && <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Checkout complete. Your account will update once payment is confirmed.</p>}<section className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 shadow-card sm:p-9"><p className="eyebrow">Founding beta access</p><h2 className="mt-3 text-3xl font-bold text-ink">Your CreditPilot access is free during the beta</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">You can use every currently available collection feature while we validate which workflows deliver the most value. No subscription charge will be made and no paid plan will begin automatically.</p><div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-2"><p>✓ Prioritised collection cases</p><p>✓ Payment-promise tracking</p><p>✓ Dispute and case controls</p><p>✓ Human-approved reminders</p><p>✓ Customer statements</p><p>✓ Collection history and evidence packs</p></div><div className="mt-7 rounded-xl bg-white p-5"><p className="font-semibold text-ink">Pricing is being validated with beta customers</p><p className="mt-2 text-sm leading-6 text-slate-600">We will publish final plans only after direct accounting integrations and measurable collection outcomes have been validated. You will receive clear notice before any paid service is introduced.</p></div></section><section className="mt-8 rounded-xl border border-rose-100 bg-rose-50 p-6"><h3 className="font-bold text-ink">Need to cancel?</h3><p className="mt-2 max-w-2xl text-sm text-slate-600">Your data is not deleted immediately. Submit a request and we’ll confirm the cancellation.</p><form action={requestCancellation} className="mt-4"><button className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700" type="submit">Request cancellation</button></form></section></div></div></main>;
}

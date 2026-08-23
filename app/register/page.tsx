import { RegisterForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function RegisterPage() { return <main className="grid min-h-screen place-items-center p-6"><section className="w-full max-w-md"><Logo /><div className="mt-10 rounded-2xl border border-slate-100 bg-white p-7 shadow-card"><p className="eyebrow">Free beta access</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Take control beyond the ledger</h1><p className="mt-2 text-sm leading-6 text-slate-500">Create your CreditPilot workspace and import invoice data from your existing accounting software. No credit card or contract is required during the beta.</p><RegisterForm /></div></section></main>; }

import { LoginForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function LoginPage() { return <main className="grid min-h-screen place-items-center p-6"><section className="w-full max-w-md"><Logo /><div className="mt-10 rounded-2xl border border-slate-100 bg-white p-7 shadow-card"><p className="eyebrow">Welcome back</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Log in to your workspace</h1><p className="mt-2 text-sm leading-6 text-slate-500">Manage invoices, follow-ups and cash flow in one place.</p><LoginForm /></div></section></main>; }

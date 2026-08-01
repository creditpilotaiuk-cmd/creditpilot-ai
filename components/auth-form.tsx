import Link from "next/link";
import { loginAction, registerAction } from "@/app/auth/actions";

export function RegisterForm() {
  return <form action={registerAction} className="mt-7 space-y-4">
    <><label className="block text-sm font-medium text-slate-700">Your name<input name="name" required className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" placeholder="Sarah Jones" /></label><label className="block text-sm font-medium text-slate-700">Company name<input name="companyName" required className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" placeholder="Acme Services Ltd" /></label></>
    <label className="block text-sm font-medium text-slate-700">Work email<input name="email" required type="email" className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" placeholder="sarah@company.co.uk" /></label>
    <label className="block text-sm font-medium text-slate-700">Password<input name="password" required type="password" minLength={8} className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" placeholder="At least 8 characters" /></label>
    <button className="button-primary w-full" type="submit">Create your account</button>
    <p className="text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-electric">Log in</Link></p>
  </form>;
}

export function LoginForm() {
  return <form action={loginAction} className="mt-7 space-y-4">
    <label className="block text-sm font-medium text-slate-700">Work email<input name="email" required type="email" className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" placeholder="sarah@company.co.uk" /></label>
    <label className="block text-sm font-medium text-slate-700">Password<input name="password" required type="password" minLength={8} className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-electric focus:ring-2 focus:ring-blue-100" placeholder="At least 8 characters" /></label>
    <button className="button-primary w-full" type="submit">Log in</button>
    <p className="text-center text-sm"><Link href="/forgot-password" className="font-semibold text-electric">Forgot your password?</Link></p>
    <p className="text-center text-sm text-slate-500">New to CreditPilot AI? <Link href="/register" className="font-semibold text-electric">Start your free trial</Link></p>
  </form>;
}

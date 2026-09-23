import { RegisterForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

const registerErrors = {
  details: "Please complete every field, choose your business country and confirm the business-use statement.",
  exists: "An account already exists for that email address. Please log in instead.",
  unavailable: "We could not create your workspace just now. Please try again in a moment.",
} as const;

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; country?: string }> }) {
  const params = await searchParams;
  const error = params.error && params.error in registerErrors ? registerErrors[params.error as keyof typeof registerErrors] : null;
  const country = ["GB", "IE", "US"].includes(params.country || "") ? params.country ?? "GB" : "GB";

  return <main className="grid min-h-screen place-items-center p-6"><section className="w-full max-w-md"><Logo /><div className="mt-10 rounded-2xl border border-slate-100 bg-white p-7 shadow-card"><p className="eyebrow">Free beta access</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Take control beyond the ledger</h1><p className="mt-2 text-sm leading-6 text-slate-500">Create your CreditPilot workspace and import invoice data from your existing accounting software. No credit card or contract is required during the beta.</p>{error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">{error}</p>}<RegisterForm country={country} /></div></section></main>;
}

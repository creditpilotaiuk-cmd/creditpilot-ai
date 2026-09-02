import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/lib/auth";
import { Logo } from "./logo";

export async function MarketingNav() {
  noStore();
  const session = await auth();
  const signedIn = Boolean(session?.user?.email);

  return <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
    <Logo />
    <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
      <Link href="/products">Products</Link>
      <Link href="/#features">Features</Link>
      <Link href="/#how-it-works">How it works</Link>
      <Link href="/#difference">Why CreditPilot</Link>
      <Link href="/compliance">Compliance</Link>
      <Link href="/#pricing">Beta access</Link>
    </nav>
    <div className="flex items-center gap-2 sm:gap-3">{signedIn ? <Link className="button-primary px-3 py-2.5 sm:px-4" href="/dashboard">Dashboard</Link> : <><Link className="text-sm font-semibold text-navy" href="/login">Log in</Link><Link className="button-primary px-3 py-2.5 sm:px-4" href="/register">Start free beta</Link></>}</div>
  </header>;
}

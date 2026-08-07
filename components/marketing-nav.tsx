import Link from "next/link";
import { Logo } from "./logo";

export function MarketingNav() {
  return <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
    <Logo />
    <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
<Link href="/#features">Features</Link><Link href="/#how-it-works">How it works</Link><Link href="/#pricing">Pricing</Link><Link href="/about">About</Link><Link href="/terms">Terms</Link>
    </nav>
    <div className="flex items-center gap-3"><Link className="hidden text-sm font-semibold text-navy sm:block" href="/login">Log in</Link><Link className="button-primary px-4 py-2.5" href="/register">Book a demo</Link></div>
  </header>;
}

"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center px-6 py-16"><section className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card"><p className="eyebrow">Temporary problem</p><h1 className="mt-3 text-3xl font-bold text-ink">We couldn&apos;t load this page</h1><p className="mt-4 leading-7 text-slate-600">Your information is safe. Please try again in a moment, or return to the homepage.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="button-primary" onClick={reset}>Try again</button><Link className="button-secondary" href="/">Return home</Link></div></section></main>;
}

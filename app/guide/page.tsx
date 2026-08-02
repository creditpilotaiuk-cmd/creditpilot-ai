import Link from "next/link";

const steps = [
  ["1", "Set up your workspace", "Add your business name, contact details, payment instructions and reminder settings.", "/settings"],
  ["2", "Add your customers", "Create customer records with the correct contact names and email addresses.", "/customers"],
  ["3", "Add or import invoices", "Enter invoices individually or upload a CSV, then check the dates and amounts.", "/invoices"],
  ["4", "Send invoices and statements", "Send each invoice to the right contact or create a statement of outstanding balances.", "/statements"],
  ["5", "Generate reminders", "Create the controlled three-stage sequence: friendly reminder, second reminder and final demand.", "/reminders"],
  ["6", "Review payments and reports", "Record payments and use the dashboard to understand your cash position.", "/payments"],
];

export default function GuidePage() {
  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-4xl"><Link href="/dashboard" className="text-sm font-medium text-electric">← Back to dashboard</Link><div className="mt-8 rounded-2xl border bg-white p-8 shadow-card"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-electric">Customer guide</p><h1 className="mt-3 text-3xl font-bold text-ink">Getting started with CreditPilot AI</h1><p className="mt-3 max-w-2xl text-slate-600">Follow these simple steps to set up your workspace, manage invoices and start improving cash flow.</p><div className="mt-8 space-y-4">{steps.map(([number, title, description, href]) => <Link href={href as any} key={number} className="group flex gap-4 rounded-xl border p-5 transition hover:border-electric hover:bg-sky/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-electric font-bold text-white">{number}</span><span><span className="block text-lg font-semibold text-ink">{title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span><span className="mt-2 block text-sm font-semibold text-electric">Open this area →</span></span></Link>)}</div><div className="mt-8 rounded-xl bg-sky p-5"><h2 className="font-semibold text-ink">Need help?</h2><p className="mt-1 text-sm text-slate-600">If something does not look right, contact support and include the invoice or customer name where possible.</p><Link href="/support" className="mt-3 inline-block text-sm font-semibold text-electric">Report a problem →</Link></div></div></div></main>;
}

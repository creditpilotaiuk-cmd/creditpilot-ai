import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type InvoiceRow = [customer: string, invoice: string, amount: number, status: string, risk: "High" | "Medium" | "Low"];

const invoices: InvoiceRow[] = [
  ["ABC Construction", "INV-1023", 2450, "30 days late", "High"],
  ["Smith Electrical", "INV-1041", 890, "7 days late", "Medium"],
  ["Horizon Homes", "INV-1038", 4200, "14 days late", "High"],
  ["Greenline Ltd", "INV-1052", 1250, "3 days late", "Low"],
];

export function InvoiceTable() {
  return <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="flex items-center justify-between p-5"><div><h2 className="font-bold text-ink">Invoices requiring attention</h2><p className="mt-1 text-sm text-slate-500">Prioritised by payment risk and value.</p></div><button className="text-sm font-semibold text-electric">View all</button></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-y bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Invoice</th><th className="px-5 py-3 font-semibold">Amount</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3"></th></tr></thead><tbody>{invoices.map(([customer, invoice, amount, status, risk]) => <tr key={invoice} className="border-b last:border-0"><td className="px-5 py-4 font-semibold text-ink">{customer}</td><td className="px-5 py-4 text-slate-500">{invoice}</td><td className="px-5 py-4 font-semibold">{formatCurrency(amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${risk === "High" ? "bg-red-50 text-red-600" : risk === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{status}</span></td><td className="px-5 py-4"><button aria-label={`View ${invoice}`} className="text-electric"><ArrowUpRight size={18} /></button></td></tr>)}</tbody></table></div></section>;
}

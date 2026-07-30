import { cn } from "@/lib/utils";

export function StatCard({ label, value, trend, tone = "blue" }: { label: string; value: string; trend: string; tone?: "blue" | "green" | "amber" }) {
  const tones = { blue: "bg-blue-50 text-electric", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700" };
  return <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-card"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p><span className={cn("mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{trend}</span></article>;
}

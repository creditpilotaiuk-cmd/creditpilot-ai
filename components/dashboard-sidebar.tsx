import { BarChart3, Bell, Bot, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const links = [[LayoutDashboard, "Dashboard"], [FileText, "Invoices"], [Users, "Customers"], [Bell, "Reminders"], [Bot, "CreditPilot Copilot"], [BarChart3, "Reports"]] as const;

export function DashboardSidebar() {
  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block"><Logo href="/dashboard" /><div className="mt-10 space-y-1">{links.map(([Icon, label], index) => <Link href={label === "Customers" ? "/customers" : label === "Invoices" ? "/invoices" : label === "Reminders" ? "/reminders" : label === "Dashboard" ? "/dashboard" : "#"} key={label} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${index === 0 ? "bg-sky text-electric" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={18} />{label}</Link>)}</div><button className="mt-10 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600"><Settings size={18} />Settings</button><div className="mt-16 rounded-xl bg-ink p-4 text-white"><p className="text-sm font-semibold">Need a hand?</p><p className="mt-1 text-xs leading-5 text-blue-100">Ask CreditPilot Copilot for your next best action.</p></div></aside>;
}

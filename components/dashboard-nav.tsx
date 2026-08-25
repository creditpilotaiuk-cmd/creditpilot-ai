"use client";

import { BarChart3, Bell, Bot, ClipboardList, CreditCard, FileText, LayoutDashboard, LifeBuoy, MessageSquareText, Scale, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { label: "Daily work", links: [[LayoutDashboard, "Overview", "/dashboard"], [ClipboardList, "Today's Chase List", "/collections"], [Bot, "Recommended actions", "/copilot"]] },
  { label: "Accounts", links: [[Users, "Customers", "/customers"], [FileText, "Invoice data", "/invoices"]] },
  { label: "Collection work", links: [[Bell, "Chase communications", "/reminders"], [ClipboardList, "Promises & payments", "/payments"], [ClipboardList, "Statements", "/statements"], [MessageSquareText, "Collection timeline", "/communications"]] },
  { label: "Insights", links: [[BarChart3, "Collection analytics", "/reports"]] },
  { label: "Account", links: [[Settings, "Settings & integrations", "/settings"], [CreditCard, "Membership", "/pricing"], [LifeBuoy, "Report a problem", "/support"]] },
  { label: "Legal", links: [[Scale, "Terms", "/terms"], [ShieldCheck, "Privacy", "/privacy"]] },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return <nav aria-label="Workspace" className="mt-7 space-y-5">
    {groups.map(group => {
      const headingId = `nav-${group.label.replaceAll(" ", "-").toLowerCase()}`;
      return <section key={group.label} aria-labelledby={headingId}>
        <h2 id={headingId} className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</h2>
        <div className="space-y-1">{group.links.map(([Icon, label, href]) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return <Link href={href} key={label} aria-current={active ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${active ? "bg-sky text-electric" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}><Icon aria-hidden="true" size={18} />{label}</Link>;
        })}</div>
      </section>;
    })}
  </nav>;
}

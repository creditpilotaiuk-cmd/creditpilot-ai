import { Building2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "./logo";
import { LogoutButton } from "./logout-button";
import { DashboardNav } from "./dashboard-nav";

export async function DashboardSidebar() {
  const session = await auth();
  const platformAdmin = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { isPlatformAdmin: true } })
    : null;

  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
    <Logo href="/collections" />
    <p className="mt-3 text-xs leading-5 text-slate-500">Your credit-control system of action</p>
    <DashboardNav />
    <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
      {platformAdmin?.isPlatformAdmin ? <Link href="/admin" className="flex w-full items-center gap-3 rounded-lg bg-violet-50 px-3 py-2.5 text-left text-sm font-semibold text-violet-700 hover:bg-violet-100"><Building2 size={18} />Platform Admin</Link> : null}
      <LogoutButton />
    </div>
  </aside>;
}

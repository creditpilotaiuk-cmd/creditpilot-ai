import Link from "next/link";
import type { Route } from "next";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: Route; className?: string }) {
  return <Link href={href} className={cn("flex items-center gap-2.5 font-bold text-ink", className)}>
    <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-electric text-white shadow-lg shadow-blue-500/25"><TrendingUp size={20} strokeWidth={2.5} /></span>
    <span className="text-lg tracking-tight">CreditPilot <span className="text-electric">AI</span></span>
  </Link>;
}

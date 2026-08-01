"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"><LogOut size={18} />Log out</button>;
}

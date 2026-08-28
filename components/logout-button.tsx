"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut({ redirect: false });
      window.location.replace("/login?loggedOut=1");
    } catch {
      setSigningOut(false);
      window.location.reload();
    }
  }

  return <button type="button" onClick={handleLogout} disabled={signingOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"><LogOut size={18} />{signingOut ? "Signing out…" : "Log out"}</button>;
}


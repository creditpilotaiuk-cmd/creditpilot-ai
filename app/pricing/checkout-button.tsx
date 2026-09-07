"use client";
import { useState } from "react";

export function CheckoutButton({ item, label = "Subscribe to this plan", className = "button-primary w-full" }: { item: string; label?: string; className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setLoading(true); setError("");
    const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item }) });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error || "Unable to start checkout."); setLoading(false); }
  }
  return <div><button type="button" onClick={start} disabled={loading} className={className}>{loading ? "Opening secure checkout…" : label}</button>{error && <p className="mt-2 text-xs text-rose-100">{error}</p>}</div>;
}

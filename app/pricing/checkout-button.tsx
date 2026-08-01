"use client";
import { useState } from "react";

export function CheckoutButton({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setLoading(true); setError("");
    const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error || "Unable to start checkout."); setLoading(false); }
  }
  return <div><button type="button" onClick={start} disabled={loading} className="button-primary w-full">{loading ? "Opening secure checkout…" : "Subscribe to this plan"}</button>{error && <p className="mt-2 text-xs text-rose-600">{error}</p>}</div>;
}

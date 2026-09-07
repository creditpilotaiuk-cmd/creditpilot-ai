"use client";
import { useState } from "react";

export function CheckoutButton({ item, label = "Subscribe to this plan", className = "button-primary w-full" }: { item: string; label?: string; className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item }) });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error || "Stripe checkout could not be opened. Please try again.");
    } catch {
      setError("Stripe checkout could not be reached. Please refresh the page and try again.");
    }
    setLoading(false);
  }
  return <div><button type="button" onClick={start} disabled={loading} className={className}>{loading ? "Opening secure checkout…" : label}</button>{error && <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold leading-5 text-rose-700">{error}</p>}</div>;
}

"use client";
import Link from "next/link";
import { useId, useState } from "react";

export function CheckoutButton({ item, label = "Subscribe to this plan", className = "button-primary w-full", businessOnly = false, businessOnlyLabel = "Irish" }: { item: string; label?: string; className?: string; businessOnly?: boolean; businessOnlyLabel?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyerType, setBuyerType] = useState<"business" | "consumer" | "">("");
  const [immediateAccessConsent, setImmediateAccessConsent] = useState(false);
  const fieldId = useId();
  async function start() {
    if (!buyerType) {
      setError("Please tell us whether you are buying for a business or for personal use.");
      return;
    }
    if (businessOnly && buyerType !== "business") {
      setError(`${businessOnlyLabel} memberships are currently available to business customers only.`);
      return;
    }
    if (buyerType === "consumer" && !immediateAccessConsent) {
      setError("Please confirm the immediate-access statement before continuing to secure checkout.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item, buyerType, immediateAccessConsent }) });
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
  return <div className="space-y-3">
    <fieldset className="rounded-xl border border-slate-200 bg-white/70 p-3 text-left">
      <legend className="px-1 text-xs font-bold text-ink">How are you buying?</legend>
      <label className="mt-1 flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700"><input type="radio" name={`${fieldId}-buyer-type`} value="business" checked={buyerType === "business"} onChange={() => { setBuyerType("business"); setImmediateAccessConsent(false); }} className="mt-1" /> <span><strong>For a business</strong> - I am buying mainly for my trade, business, craft or profession.</span></label>
      {businessOnly ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{businessOnlyLabel} memberships are currently available to business customers only while consumer tax treatment is being finalised.</p> : <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700"><input type="radio" name={`${fieldId}-buyer-type`} value="consumer" checked={buyerType === "consumer"} onChange={() => setBuyerType("consumer")} className="mt-1" /> <span><strong>For personal use</strong> - I am buying mainly outside my trade, business, craft or profession.</span></label>}
      {buyerType === "consumer" && <label className="mt-3 flex cursor-pointer items-start gap-2 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-700"><input type="checkbox" checked={immediateAccessConsent} onChange={event => setImmediateAccessConsent(event.target.checked)} className="mt-1" /> <span>I expressly request immediate access to CreditPilot AI. I understand that if I cancel within a statutory cooling-off period, I may be charged a proportionate amount for the service supplied before cancellation. <Link href="/terms#plans" target="_blank" className="font-bold text-electric underline">Read the Terms</Link>.</span></label>}
    </fieldset>
    <button type="button" onClick={start} disabled={loading} className={className}>{loading ? "Opening secure checkout…" : label}</button>
    {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold leading-5 text-rose-700">{error}</p>}
  </div>;
}

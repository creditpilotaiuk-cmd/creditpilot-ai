"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Unable to send");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return <form className="mt-8 space-y-5" onSubmit={submit}>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-ink">Full name
        <input required name="name" autoComplete="name" maxLength={120} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Your name" />
      </label>
      <label className="block text-sm font-semibold text-ink">Business name
        <input name="business" autoComplete="organization" maxLength={160} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Your business" />
      </label>
    </div>
    <label className="block text-sm font-semibold text-ink">Email address
      <input required type="email" name="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="you@business.co.uk" />
    </label>
    <label className="block text-sm font-semibold text-ink">What can we help with?
      <select name="enquiry" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
        <option>Memberships and pricing</option>
        <option>Founding beta access</option>
        <option>Product demonstration</option>
        <option>Features and integrations</option>
        <option>General enquiry</option>
      </select>
    </label>
    <label className="block text-sm font-semibold text-ink">Message
      <textarea required name="message" rows={6} maxLength={5000} className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Tell us a little about your credit-control needs." />
    </label>

    {status === "sent" && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> Thank you. Your message has been sent.</p>}
    {status === "error" && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">We could not send your message. Please try again shortly.</p>}

    <button disabled={status === "sending"} type="submit" className="button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
      {status === "sending" ? <><Loader2 className="mr-2 animate-spin" size={17} /> Sending…</> : <>Send message <Mail className="ml-2" size={17} /></>}
    </button>
  </form>;
}

"use client";

import Link from "next/link";
import { Bot, ChevronDown, CircleHelp, MessageCircleMore, Send, X } from "lucide-react";
import { useState } from "react";

export function HelpChatLauncher() {
  const [open, setOpen] = useState(false);
  const [liveChatError, setLiveChatError] = useState("");

  function openLiveChat() {
    const api = (window as Window & { Tawk_API?: { maximize?: () => void } }).Tawk_API;
    if (!api?.maximize) {
      setLiveChatError("Live chat is still loading. Please try again in a moment.");
      return;
    }
    api.maximize();
    setLiveChatError("");
    setOpen(false);
  }

  return <aside className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm" aria-label="Help and chat">
    {open && <section className="mb-3 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-2xl shadow-slate-900/20">
      <header className="flex items-center justify-between bg-gradient-to-r from-[#123d91] to-[#2867f0] px-5 py-4 text-white">
        <div className="flex items-center gap-2"><MessageCircleMore size={20} /><div><p className="font-bold">CreditPilot AI Help</p><p className="text-xs text-blue-100">AI guidance and team support</p></div></div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 transition hover:bg-white/15" aria-label="Close help and chat"><X size={20} /></button>
      </header>
      <div className="space-y-4 p-5">
        <div><h2 className="text-xl font-bold text-ink">How can we help?</h2><p className="mt-1 text-sm leading-6 text-slate-600">Start with Finance AI for a quick answer. If it cannot resolve the issue, our support team is one step away.</p></div>
        <Link href="/copilot" onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-400 hover:bg-blue-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-electric text-white"><Bot size={20} /></span>
          <span><strong className="block text-sm text-ink">Ask Finance AI</strong><span className="mt-1 block text-xs leading-5 text-slate-600">Help with invoices, payments, reminders and using your workspace.</span></span>
        </Link>
        <button type="button" onClick={openLiveChat} className="flex w-full items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-left transition hover:border-violet-400 hover:bg-violet-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-700 text-white"><Send size={19} /></span>
          <span><strong className="block text-sm text-ink">Open live chat</strong><span className="mt-1 block text-xs leading-5 text-slate-600">Chat with the CreditPilot AI support team when AI guidance has not resolved it.</span></span>
        </button>
        {liveChatError && <p role="alert" className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{liveChatError}</p>}
        <Link href="/support" onClick={() => setOpen(false)} className="block text-center text-xs font-bold text-slate-600 hover:text-electric hover:underline">Prefer to send a detailed support report?</Link>
        <Link href="/contact" onClick={() => setOpen(false)} className="block text-center text-xs font-bold text-electric hover:underline">Membership or sales question? Contact us</Link>
      </div>
    </section>}
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="ml-auto flex items-center gap-2 rounded-full bg-[#123d91] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-950/25 transition hover:-translate-y-0.5 hover:bg-[#0b2d70]">
      <CircleHelp size={19} /> {open ? "Close help" : "Help & chat"} <ChevronDown className={open ? "rotate-180 transition" : "transition"} size={17} />
    </button>
  </aside>;
}

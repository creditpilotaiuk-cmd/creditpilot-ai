"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Files, Sparkles, Users } from "lucide-react";

const memberships = [
  {
    name: "Starter",
    basePrice: 49,
    additionalUserPrice: null,
    additionalUserListPrice: null,
    userDiscount: null,
    invoices: "150 active invoices",
    description: "For small businesses establishing a reliable credit-control process.",
    accent: "from-white via-cyan-50 to-blue-100",
  },
  {
    name: "Growth",
    basePrice: 129,
    additionalUserPrice: 15.99,
    additionalUserListPrice: 15.99,
    userDiscount: null,
    invoices: "750 active invoices",
    description: "For growing SMEs with a busier debtor book and regular follow-up activity.",
    featured: true,
    accent: "from-white via-blue-50 to-violet-100",
  },
  {
    name: "Professional",
    basePrice: 249,
    additionalUserPrice: 20.69,
    additionalUserListPrice: 22.99,
    userDiscount: 10,
    invoices: "2,500 active invoices",
    description: "For larger teams needing deeper oversight, history and evidence.",
    accent: "from-white via-indigo-50 to-violet-100",
  },
];

function money(value: number) {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PricingCalculator() {
  const [users, setUsers] = useState(1);

  return <div className="space-y-12">
    <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-b from-white via-blue-50/60 to-slate-100 shadow-[0_30px_80px_rgba(30,64,175,0.14)]">
    <div className="px-6 pb-10 pt-10 text-center sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric">Team pricing calculator</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">See your monthly membership price.</h2>
      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Move the bar to select your team size. Growth and Professional prices update instantly in sterling.</p>

      <div className="mx-auto mt-9 max-w-xl rounded-3xl border border-blue-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-2 text-lg font-bold text-ink"><Users className="text-electric" size={22} /> Number of users</span>
          <output className="min-w-20 rounded-full bg-blue-50 px-5 py-2 text-xl font-bold text-electric" htmlFor="team-size">{users}</output>
        </div>
        <input
          id="team-size"
          aria-label="Number of users"
          type="range"
          min="1"
          max="25"
          step="1"
          value={users}
          onChange={(event) => setUsers(Number(event.target.value))}
          className="mt-7 h-3 w-full cursor-pointer accent-blue-600"
        />
        <div className="mt-2 flex justify-between text-sm font-semibold text-slate-500"><span>1 user</span><span>25 users</span></div>
      </div>
    </div>

    <div className="grid gap-5 px-6 pb-10 sm:px-10 lg:grid-cols-3">
      {memberships.map((membership) => {
        const extraUsers = Math.max(0, users - 1);
        const monthlyPrice = membership.basePrice + (membership.additionalUserPrice ?? 0) * extraUsers;

        return <article key={membership.name} className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-br ${membership.accent} shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${membership.name === "Starter" ? "border-cyan-200" : membership.featured ? "border-electric ring-2 ring-electric/10" : "border-violet-200"}`}>
          <div className="relative p-7 text-ink">
            {membership.featured && <span className="mb-5 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-xs font-bold text-white shadow-md">Most popular</span>}
            <h3 className="text-3xl font-bold">{membership.name}</h3>
            <p className="mt-2 text-sm font-semibold text-blue-700">{membership.invoices}</p>
          </div>
          <div className="relative flex flex-1 flex-col border-t border-white/70 bg-white/45 p-7 backdrop-blur-sm">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tight text-ink">£{money(monthlyPrice)}</span>
              <span className="pb-1.5 text-sm font-semibold text-slate-500">/ month</span>
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-500">
              <span>Base £{money(membership.basePrice)}/month</span>
              {membership.additionalUserPrice ? <span>
                {" "}+ {membership.userDiscount ? <><span className="line-through">£{money(membership.additionalUserListPrice!)}</span> <strong className="text-emerald-700">£{money(membership.additionalUserPrice)}</strong> per additional user</> : <>£{money(membership.additionalUserPrice)} per additional user</>}
              </span> : <span> · one-user workspace</span>}
            </div>
            {membership.userDiscount && <span className="mt-3 w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{membership.userDiscount}% additional-user discount</span>}
            <p className="mt-5 text-sm leading-6 text-slate-600">{membership.description}</p>
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
              <p className="flex items-center gap-2"><Check className="text-emerald-500" size={17} /> {membership.invoices} included</p>
              <p className="flex items-center gap-2"><Check className="text-emerald-500" size={17} /> {membership.additionalUserPrice ? `${users} user${users === 1 ? "" : "s"} selected` : "1 included user"}</p>
            </div>
            <Link href="/register" className="button-primary mt-7 w-full justify-center">Start free beta <ArrowRight className="ml-2" size={16} /></Link>
          </div>
        </article>;
      })}
    </div>

    </div>

    <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071535] via-[#123a78] to-[#2764ff] px-6 py-10 text-white shadow-[0_30px_80px_rgba(16,40,95,0.28)] sm:px-10 sm:py-12">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-300/15 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-cyan-200 shadow-inner ring-1 ring-white/20"><Files size={27} /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Invoice capacity add-ons</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">More room for a growing debtor book.</h3>
          <p className="mt-3 max-w-xl leading-7 text-blue-100">Increase your active invoice capacity without moving immediately to another membership.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur">
          <Sparkles size={16} className="text-cyan-200" /> Flexible monthly capacity
        </div>
      </div>

      <div className="relative mt-9 grid gap-5 sm:grid-cols-2">
        <article className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white p-7 text-ink shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
          <span className="absolute right-6 top-6 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">Save 10%</span>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 font-bold text-electric transition group-hover:scale-110">+250</span>
          <p className="mt-5 text-lg font-bold">Extra 250 invoices</p>
          <p className="mt-5 text-sm font-semibold text-slate-400 line-through">£33.30 / month</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-electric">£29.97 <span className="text-sm font-semibold text-slate-500">/ month</span></p>
          <p className="mt-4 text-sm leading-6 text-slate-600">A flexible capacity boost for a steadily growing invoice book.</p>
        </article>

        <article className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white p-7 text-ink shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-400 to-blue-500" />
          <span className="absolute right-6 top-6 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">Save 15%</span>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-700 transition group-hover:scale-110">+1K</span>
          <p className="mt-5 text-lg font-bold">Extra 1,000 invoices</p>
          <p className="mt-5 text-sm font-semibold text-slate-400 line-through">£75.00 / month</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-electric">£63.75 <span className="text-sm font-semibold text-slate-500">/ month</span></p>
          <p className="mt-4 text-sm leading-6 text-slate-600">More headroom for a larger or rapidly expanding debtor book.</p>
        </article>
      </div>

      <div className="relative mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200/30 bg-amber-50/10 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-amber-100">Company-risk checks</p>
          <p className="mt-1 text-sm leading-6 text-blue-100">Pricing will be published after supplier costs, API access and data rights are confirmed.</p>
        </div>
        <span className="w-fit rounded-full bg-amber-100/15 px-3 py-1 text-xs font-bold text-amber-100">Coming after supplier confirmation</span>
      </div>
    </section>
  </div>;
}

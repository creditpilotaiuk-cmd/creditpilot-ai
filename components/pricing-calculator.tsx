"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Users } from "lucide-react";

const memberships = [
  {
    name: "Starter",
    basePrice: 49,
    additionalUserPrice: null,
    additionalUserListPrice: null,
    userDiscount: null,
    invoices: "150 active invoices",
    description: "For small businesses establishing a reliable credit-control process.",
    accent: "from-slate-700 to-slate-900",
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
    accent: "from-blue-700 to-blue-500",
  },
  {
    name: "Professional",
    basePrice: 249,
    additionalUserPrice: 20.69,
    additionalUserListPrice: 22.99,
    userDiscount: 10,
    invoices: "2,500 active invoices",
    description: "For larger teams needing deeper oversight, history and evidence.",
    accent: "from-indigo-800 to-blue-700",
  },
];

function money(value: number) {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PricingCalculator() {
  const [users, setUsers] = useState(1);

  return <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-b from-white via-blue-50/60 to-slate-100 shadow-[0_30px_80px_rgba(30,64,175,0.14)]">
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

        return <article key={membership.name} className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-card ${membership.featured ? "border-electric ring-2 ring-electric/10" : "border-slate-200"}`}>
          <div className={`bg-gradient-to-br ${membership.accent} p-7 text-white`}>
            {membership.featured && <span className="mb-5 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Most popular</span>}
            <h3 className="text-3xl font-bold">{membership.name}</h3>
            <p className="mt-2 text-sm text-blue-100">{membership.invoices}</p>
          </div>
          <div className="flex flex-1 flex-col p-7">
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

    <div className="border-t border-blue-100 bg-[#eef4ff] px-6 py-9 sm:px-10">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-electric">Invoice capacity add-ons</p>
          <h3 className="mt-2 text-2xl font-bold text-ink">Need more invoice capacity?</h3>
        </div>
        <p className="text-sm text-slate-600">Add capacity without changing membership.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="relative rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <span className="absolute right-5 top-5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Save 10%</span>
          <p className="font-bold text-ink">Extra 250 invoices</p>
          <p className="mt-4 text-sm font-semibold text-slate-400 line-through">£33.30 / month</p>
          <p className="mt-1 text-3xl font-bold text-electric">£29.97 <span className="text-sm font-semibold text-slate-500">/ month</span></p>
        </article>
        <article className="relative rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <span className="absolute right-5 top-5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Save 15%</span>
          <p className="font-bold text-ink">Extra 1,000 invoices</p>
          <p className="mt-4 text-sm font-semibold text-slate-400 line-through">£75.00 / month</p>
          <p className="mt-1 text-3xl font-bold text-electric">£63.75 <span className="text-sm font-semibold text-slate-500">/ month</span></p>
        </article>
      </div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-bold text-amber-900">Company-risk checks</p>
        <p className="mt-2 text-sm leading-6 text-amber-800">Pricing will be published after supplier costs, API access and data rights are confirmed. This service will not be advertised as unlimited.</p>
      </div>
    </div>
  </div>;
}

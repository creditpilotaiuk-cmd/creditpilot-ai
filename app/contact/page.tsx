import Link from "next/link";
import { MessageSquare, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return <main className="min-h-screen bg-[#f5f6f8] text-slate-800">
    <MarketingNav />

    <section className="border-y border-slate-200 bg-gradient-to-br from-white via-blue-50/60 to-slate-100 px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="pt-4">
          <p className="eyebrow">Contact CreditPilot AI</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Let’s talk about better credit control.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Tell us about your business, debtor book or membership questions. We’ll respond with clear, practical information about CreditPilot AI.</p>

          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><MessageSquare size={22} /></span>
              <div>
                <p className="font-semibold text-ink">Membership guidance</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Ask which membership best suits your invoice volume and collection process.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><ShieldCheck size={22} /></span>
              <div>
                <p className="font-semibold text-ink">Private website submission</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Your message is submitted securely from the website without displaying our internal contact address.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_70px_rgba(30,64,175,0.12)] sm:p-9">
          <h2 className="text-2xl font-bold text-ink">Send us a message</h2>
          <p className="mt-2 text-slate-600">Complete the form and our team will receive your enquiry directly.</p>
          <ContactForm />
        </div>
      </div>
    </section>

    <section className="px-6 py-10 text-center lg:px-8">
      <p className="text-sm text-slate-600">Want to compare memberships first? <Link className="font-semibold text-blue-600 hover:underline" href="/products">View CreditPilot products and pricing</Link>.</p>
    </section>
  </main>;
}

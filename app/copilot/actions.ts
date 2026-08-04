"use server";
// Copilot answers are generated from the owner's live workspace context.
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function askCopilot(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const question = String(formData.get("question") || "").trim();
  if (!user || !question) redirect("/copilot");
  const invoices = await prisma.invoice.findMany({
    where: { companyId: user.companyId },
    include: { customer: true, reminders: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { dueDate: "asc" }, take: 200,
  });
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const money = (value: unknown) => `£${Number(value).toFixed(2)}`;
  const lower = question.toLowerCase();
  const largest = invoices.reduce((max, i) => Number(i.amount) > Number(max?.amount ?? 0) ? i : max, invoices[0]);
  const chaseList = [...overdue].sort((a, b) => Number(b.amount) - Number(a.amount) || b.reminders.length - a.reminders.length).slice(0, 5);
  const fallback = lower.includes("chase") || lower.includes("priority") || lower.includes("today")
    ? chaseList.length ? `Chase these customers first today, prioritised by balance and reminder history:\n${chaseList.map((i, index) => `${index + 1}. ${i.customer.name} — ${money(i.amount)} (${i.number}, ${i.reminders.length} reminder(s))`).join("\n")}` : "There are no overdue customers to chase today. Review upcoming due invoices instead."
    : lower.includes("overdue")
    ? overdue.length ? `You have ${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}, totalling ${money(overdue.reduce((sum, i) => sum + Number(i.amount), 0))}.\n${overdue.map((i) => `• ${i.number} — ${i.customer.name} — ${money(i.amount)} — ${i.reminders.length} reminder(s)`).join("\n")}` : "There are no overdue invoices."
    : lower.includes("most") || lower.includes("owe")
      ? largest ? `The largest outstanding balance is ${money(largest.amount)} for ${largest.customer.name} (${largest.number}).` : "There are no outstanding invoices."
      : "I can help with overdue invoices, largest balances, customers to chase, payment promises, reminder activity, and cash-flow priorities.";
  let answer = fallback;
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const context = invoices.map((i) => `${i.number} | customer: ${i.customer.name} | email: ${i.customer.email} | amount: ${money(i.amount)} | due: ${i.dueDate.toISOString().slice(0, 10)} | status: ${i.status} | reminders sent: ${i.reminders.length}`).join("\n");
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, messages: [{ role: "system", content: "You are CreditPilot Copilot, an expert UK credit-control assistant. Answer the owner's question using only the supplied workspace data. Be concise, practical and transparent. Never invent payments, promises, legal action, or bank details. If data is missing, say so and recommend the next action." }, { role: "user", content: `Workspace invoice data:\n${context || "No invoices recorded."}\n\nOwner question: ${question}` }] }) });
      const json = await response.json();
      answer = json.choices?.[0]?.message?.content?.trim() || fallback;
    } catch { /* Use the local answer if AI is unavailable. */ }
  }
  redirect(`/copilot?answer=${encodeURIComponent(answer)}&question=${encodeURIComponent(question)}`);
}

export async function analyseCustomerReply(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const reply = String(formData.get("reply") || "").trim();
  if (!user || !reply) redirect("/copilot");
  const lower = reply.toLowerCase();
  let result = lower.includes("paid") || lower.includes("payment sent")
    ? "Classification: PAYMENT CONFIRMATION\nNext action: Verify the payment in your bank or accounting system before marking the invoice paid.\nSuggested reply: Thanks for the update. We’ll confirm receipt and update your account shortly."
    : lower.includes("dispute") || lower.includes("incorrect") || lower.includes("wrong")
      ? "Classification: QUERY OR DISPUTE\nNext action: Pause escalation, review the invoice and ask for the specific issue to be resolved.\nSuggested reply: Thanks for letting us know. We’ll review this promptly and come back to you with an update."
      : lower.includes("friday") || lower.includes("tomorrow") || lower.includes("pay") || lower.includes("transfer")
        ? "Classification: PROMISE TO PAY\nNext action: Record the promised payment date and schedule a follow-up for the next business day.\nSuggested reply: Thanks for confirming. We’ve noted your expected payment date and will follow up if needed."
        : "Classification: NEEDS REVIEW\nNext action: Read the message carefully and respond personally; do not escalate until the customer’s position is clear.\nSuggested reply: Thanks for your message. We’re reviewing this and will come back to you shortly.";
  const key = process.env.OPENAI_API_KEY;
  if (key) try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, messages: [{ role: "system", content: "You are CreditPilot Copilot. Analyse a customer payment-related email. Return exactly three concise lines beginning Classification:, Next action:, Suggested reply:. Classify as PAYMENT CONFIRMATION, PROMISE TO PAY, QUERY OR DISPUTE, NEED MORE TIME, or NEEDS REVIEW. Never claim a payment is received without verification and never give legal advice." }, { role: "user", content: reply }] }) });
    const json = await response.json();
    result = json.choices?.[0]?.message?.content?.trim() || result;
  } catch { /* fallback */ }
  redirect(`/copilot?replyResult=${encodeURIComponent(result)}`);
}

export async function generateCollectionIntelligence() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const invoices = await prisma.invoice.findMany({ where: { companyId: user.companyId }, include: { customer: true, paymentPromises: true, reminders: true }, orderBy: { dueDate: "asc" }, take: 300 });
  const now = new Date();
  const overdue = invoices.filter(i => i.status === "OVERDUE");
  const promises = invoices.flatMap(i => i.paymentPromises.map(p => ({ invoice: i.number, customer: i.customer.name, promisedFor: p.promisedFor.toISOString().slice(0, 10), status: p.status })));
  const context = invoices.map(i => `${i.number}|${i.customer.name}|${i.amount}|due ${i.dueDate.toISOString().slice(0,10)}|${i.status}|reminders ${i.reminders.length}`).join("\n");
  const fallback = `AI collection review\n\nDaily action plan\n1. Prioritise ${overdue.slice(0, 3).map(i => i.customer.name).join(", ") || "upcoming due invoices"}.\n2. Review any open payment promises and follow up on missed dates.\n3. Send the next approved reminder only after checking for disputes.\n\nRisk alerts\n${overdue.length ? `${overdue.length} overdue invoice(s) need attention, including high-value balances.` : "No overdue invoices detected."}\n\nPayment-plan guidance\nOffer staged instalments for high-value balances where the customer requests more time; agree dates in writing.\n\nFollow-up scheduling\nSet the next contact for 2 business days after a promise date or customer reply.`;
  let result = fallback;
  const key = process.env.OPENAI_API_KEY;
  if (key) try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, messages: [{ role: "system", content: "You are CreditPilot Copilot. Produce a concise practical collection intelligence report with these headings: Daily action plan, Payment-risk scoring, Promise-to-pay alerts, Payment-plan suggestions, Reminder tone and next follow-up, Collection risk alerts, and Plain-English statement summary. Use only supplied data. Do not invent facts or claim payments are received. Mention when data is insufficient." }, { role: "user", content: `Today: ${now.toISOString().slice(0,10)}\nInvoices:\n${context || "No invoices"}\nPromises:\n${JSON.stringify(promises)}` }] }) });
    const json = await response.json(); result = json.choices?.[0]?.message?.content?.trim() || fallback;
  } catch { /* fallback */ }
  redirect(`/copilot?intelligence=${encodeURIComponent(result)}`);
}

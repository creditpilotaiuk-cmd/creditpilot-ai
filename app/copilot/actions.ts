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
  const fallback = lower.includes("overdue")
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

"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function askCopilot(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const question = String(formData.get("question") || "").trim();
  if (!user || !question) redirect("/copilot");
  const invoices = await prisma.invoice.findMany({ where: { companyId: user.companyId, status: { in: ["OUTSTANDING", "OVERDUE"] } }, include: { customer: true }, take: 100 });
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const lower = question.toLowerCase();
  let answer: string;
  if (lower.includes("overdue")) {
    answer = overdue.length ? `You have ${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}:\n${overdue.map((i) => `• ${i.number} — ${i.customer.name} — £${Number(i.amount).toFixed(2)}`).join("\n")}` : "There are no overdue invoices.";
  } else {
    const key = process.env.OPENAI_API_KEY;
    if (!key) answer = "OPENAI_API_KEY is not configured yet. Try asking which invoices are overdue.";
    else {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: "You are CreditPilot Copilot. Answer only from the supplied company invoice data." }, { role: "user", content: `Invoice data:\n${invoices.map((i) => `${i.number} | ${i.customer.name} | £${i.amount} | ${i.status}`).join("\n")}\n\nQuestion: ${question}` }], temperature: 0.2 }) });
        const json = await response.json();
        answer = json.choices?.[0]?.message?.content || "I could not answer that.";
      } catch { answer = "I couldn't reach the AI service just now. Try asking which invoices are overdue."; }
    }
  }
  redirect(`/copilot?answer=${encodeURIComponent(answer)}&question=${encodeURIComponent(question)}`);
}

"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/welcome-email";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function companySlug(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "company"}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function registerAction(formData: FormData) {
  const name = text(formData, "name");
  const companyName = text(formData, "companyName");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const country = text(formData, "country");
  const businessUse = formData.get("businessUse") === "on";

  const countryParam = ["GB", "IE", "US"].includes(country) ? country : "GB";
  if (!name || !companyName || !email || password.length < 8 || !businessUse || !["GB", "IE", "US"].includes(country)) redirect(`/register?error=details&country=${countryParam}`);
  if (await prisma.user.findUnique({ where: { email } })) redirect(`/register?error=exists&country=${countryParam}`);

  const passwordHash = await bcrypt.hash(password, 12);
  let company: { id: string; users: { id: string }[] };
  try {
    company = await prisma.company.create({
      data: {
        name: companyName,
        slug: companySlug(companyName),
        billingEmail: email,
        country,
        defaultCurrency: country === "IE" ? "EUR" : country === "US" ? "USD" : "GBP",
        businessUseConfirmedAt: new Date(),
        users: { create: { name, email, passwordHash, role: "OWNER" } },
      },
      include: { users: { select: { id: true } } },
    });
  } catch {
    redirect(`/register?error=unavailable&country=${countryParam}`);
  }

  const delivered = await sendWelcomeEmail({ name, email, companyName });
  try {
    await prisma.auditEvent.create({
      data: {
        companyId: company.id,
        userId: company.users[0]?.id,
        action: delivered ? "WELCOME_EMAIL_SENT" : "WELCOME_EMAIL_FAILED",
        entity: "Company",
        entityId: company.id,
      },
    });
  } catch { /* Account creation should not be blocked if audit logging is unavailable. */ }
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function loginAction(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=credentials");
    throw error;
  }
}

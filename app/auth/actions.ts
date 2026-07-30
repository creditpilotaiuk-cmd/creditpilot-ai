"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

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

  if (!name || !companyName || !email || password.length < 8) redirect("/register?error=details");
  if (await prisma.user.findUnique({ where: { email } })) redirect("/register?error=exists");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.company.create({
    data: {
      name: companyName,
      slug: companySlug(companyName),
      billingEmail: email,
      users: { create: { name, email, passwordHash, role: "OWNER" } },
    },
  });
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

"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

export async function createCustomer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const name = value(formData, "name");
  const contactName = value(formData, "contactName");
  const email = value(formData, "email");
  const phone = value(formData, "phone");
  if (!name) redirect("/customers?error=name");

  await prisma.customer.create({ data: { companyId: user.companyId, name, contactName: contactName || null, email: email || null, phone: phone || null } });
  redirect("/customers?created=1");
}

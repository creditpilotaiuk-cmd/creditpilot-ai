import crypto from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function validSignature(payload: string, signature: string, secret: string) {
  const timestamp = signature.split(",").find((part) => part.startsWith("t="))?.slice(2);
  const signatures = signature.split(",").filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((value) => value.length === expected.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected)));
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = (await headers()).get("stripe-signature");
  const payload = await request.text();
  if (!secret || !signature || !validSignature(payload, signature, secret)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  const event = JSON.parse(payload);
  if (["checkout.session.completed", "customer.subscription.created", "customer.subscription.updated"].includes(event.type)) {
    const object = event.data.object;
    const metadata = object.metadata || object.subscription_details?.metadata || {};
    if (metadata.companyId && ["Starter", "Growth", "Professional"].includes(metadata.plan)) {
      await prisma.company.update({ where: { id: metadata.companyId }, data: { plan: metadata.plan, stripeCustomerId: object.customer || undefined } });
    }
  }
  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const overduePromises = await prisma.paymentPromise.findMany({
    where: { status: "OPEN", promisedFor: { lt: now } },
    include: {
      customer: true,
      invoice: true,
      company: {
        select: {
          billingEmail: true,
          users: {
            where: { role: { in: ["OWNER", "ADMIN"] } },
            select: { email: true },
          },
        },
      },
    },
    orderBy: { promisedFor: "asc" },
  });

  let processed = 0;
  let alertsSent = 0;
  let alertFailures = 0;

  for (const promise of overduePromises) {
    const claimed = await prisma.$transaction(async (tx) => {
      const result = await tx.paymentPromise.updateMany({
        where: { id: promise.id, status: "OPEN", promisedFor: { lt: now } },
        data: { status: "BROKEN" },
      });

      if (result.count === 1) {
        await tx.auditEvent.create({
          data: {
            companyId: promise.companyId,
            action: "PAYMENT_PROMISE_BROKEN",
            entity: "PaymentPromise",
            entityId: promise.id,
            metadata: { promisedFor: promise.promisedFor.toISOString() },
          },
        });
      }

      return result.count === 1;
    });

    if (!claimed) continue;
    processed += 1;

    const recipients = Array.from(
      new Set([
        promise.company.billingEmail,
        ...promise.company.users.map((user) => user.email),
      ].filter((email): email is string => Boolean(email))),
    );

    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL;
    if (!resendKey || !resendFrom || recipients.length === 0) continue;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: recipients,
        subject: `Missed payment promise: ${promise.invoice?.number || "Invoice"}`,
        text: `${promise.customer.name} missed a promised payment date for ${promise.invoice?.number || "an invoice"}. Amount: £${Number(promise.amount || 0).toFixed(2)}. Review the account and contact the customer.`,
      }),
    });

    if (response.ok) alertsSent += 1;
    else alertFailures += 1;
  }

  return NextResponse.json({
    ok: true,
    checkedAt: now.toISOString(),
    candidates: overduePromises.length,
    processed,
    alertsSent,
    alertFailures,
  });
}


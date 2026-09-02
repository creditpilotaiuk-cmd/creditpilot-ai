import { NextResponse } from "next/server";

const allowedEnquiries = new Set([
  "Memberships and pricing",
  "Founding beta access",
  "Product demonstration",
  "Features and integrations",
  "General enquiry",
]);

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 120);
    const business = clean(body.business, 160);
    const email = clean(body.email, 254);
    const message = clean(body.message, 5000);
    const enquiry = allowedEnquiries.has(body.enquiry) ? body.enquiry : "General enquiry";

    if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const destination = process.env.CONTACT_EMAIL;

    if (!apiKey || !destination) {
      console.error("Contact form email delivery is not configured.");
      return NextResponse.json({ error: "Email delivery is unavailable." }, { status: 503 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CreditPilot AI website <onboarding@resend.dev>",
        to: [destination],
        reply_to: email,
        subject: `Website enquiry: ${enquiry}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;color:#0f172a">
            <h2 style="color:#123a78">New CreditPilot AI website enquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Business:</strong> ${escapeHtml(business || "Not provided")}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Enquiry:</strong> ${escapeHtml(enquiry)}</p>
            <hr style="border:0;border-top:1px solid #dbeafe;margin:24px 0" />
            <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error("Contact email provider rejected the submission.", response.status);
      return NextResponse.json({ error: "Unable to send message." }, { status: 502 });
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

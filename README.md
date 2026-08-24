# CreditPilot AI

**Turn overdue invoices into clear daily actions.**

CreditPilot AI is a multi-tenant collection workspace for UK businesses. It is designed to sit alongside accounting software and organise the operational work needed to recover overdue invoices: priorities, reminders, promises, disputes, case decisions and evidence.

CreditPilot is not accounting software, does not submit tax or VAT returns, and is not affiliated with or endorsed by Xero, Intuit/QuickBooks or Sage. The current beta imports invoice data; direct accounting integrations are planned but do not yet exist.

## What is included

- Next.js 15 App Router, TypeScript and Tailwind CSS
- Responsive CreditPilot AI landing page using the agreed navy and electric-blue brand
- Login and registration pages, plus an Auth.js credentials scaffold
- Live owner dashboard and prioritised daily collections workspace
- Prisma/PostgreSQL multi-tenant schema for companies, users, customers, invoices, reminders, promises and audit events
- Human-approved reminder drafting and sending, customer statements and collection evidence packs
- Private platform administration for authorised CreditPilot owners
- Extensible environment configuration for OpenAI, Stripe and Resend

## Run locally

1. Install Node.js 20.9 or newer and PostgreSQL.
2. Double-click `set-database-url.cmd` to save your Neon connection string, then set a secure `AUTH_SECRET` before production use. Alternatively, copy `.env.example` to `.env` and fill in the values manually.
3. Install packages: `npm install`
4. Create the database tables: `npm run db:migrate -- --name init`
5. Start the app: `npm run dev`
6. Open `http://localhost:3000`.

On Windows, you can instead double-click `start-creditpilot.cmd`. It clears only the temporary `.next` build cache and starts the local server. Keep its window open while using the app.

## Project map

```
app/                   Routes, marketing site and dashboard
app/api/auth/          Auth.js route handler
components/            Reusable UI components
lib/auth.ts            Authentication integration seam
lib/prisma.ts          Shared Prisma client
prisma/schema.prisma   Multi-tenant data model
```

## Product direction

The accounting platform remains the financial system of record. CreditPilot is concentrating on the work that happens around the ledger:

1. Explainable daily collection priorities.
2. Promise-to-pay, dispute, hold and payment-plan workflows.
3. Complete customer collection histories and evidence-ready escalation packs.
4. Measurable collection outcomes, including cash recovered and promises kept.
5. Direct accounting data connections, beginning with Xero after customer validation.

Pricing is intentionally not final during the founding beta. Do not enable paid checkout until the connected workflow and measurable customer value have been validated.

## Integration roadmap

### Authentication

The application uses Auth.js credentials with company-scoped database access and password recovery. Before general availability, complete email verification, production security review and broader authentication testing.

### AI

Add a server-side service (for example `lib/ai.ts`) that uses invoice and payment history to produce reminder drafts and `AIRecommendation` records. Keep the OpenAI key server-side and require human approval before externally sending any AI-produced message in the first release.

### Billing

Stripe checkout and webhook foundations exist, but paid plans are paused during product and pricing validation. Before enabling subscriptions, finalise plans, confirm customer value, test the complete billing lifecycle and provide a customer portal.

### Sending reminders

Resend-backed reminder delivery is implemented with human approval and audit events. A valid production sender and API key are required. Scheduled background delivery still needs a production-grade job runner and retry monitoring.

## Important launch notes

The dashboard reads company-scoped production data. Continue to require human approval for externally visible actions, preserve tenant isolation, and complete email-domain, privacy, security and legal/compliance review before a wider launch.

## Suggested next sprint

1. Interview finance managers who already use Xero, QuickBooks or Sage and validate the daily collection workflow.
2. Add ownership, next-action dates and outcome tracking to collection cases.
3. Build and validate a read-only Xero connection using the official OAuth/API programme.
4. Measure cash recovered, promise-kept rate and overdue-debt movement.
5. Assess QuickBooks and Sage connections only after the Xero workflow proves useful.

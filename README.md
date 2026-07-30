# CreditPilot AI

**Smarter Credit Control. Faster Payments.**

CreditPilot AI is a multi-tenant SaaS foundation for UK businesses that need a more intelligent way to manage invoice follow-ups, overdue debt and payment promises.

## What is included

- Next.js 15 App Router, TypeScript and Tailwind CSS
- Responsive CreditPilot AI landing page using the agreed navy and electric-blue brand
- Login and registration pages, plus an Auth.js credentials scaffold
- Interactive dashboard prototype with AI recommendations and priority invoices
- Prisma/PostgreSQL multi-tenant schema for companies, users, customers, invoices, reminders, promises and audit events
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

## Integration roadmap

### Authentication

`lib/auth.ts` contains an Auth.js credentials provider placeholder. Before launch, add secure registration, bcrypt password verification, account recovery, email verification, session access control and company onboarding. You can also replace credentials with Google or Microsoft SSO.

### AI

Add a server-side service (for example `lib/ai.ts`) that uses invoice and payment history to produce reminder drafts and `AIRecommendation` records. Keep the OpenAI key server-side and require human approval before externally sending any AI-produced message in the first release.

### Billing

Use `Company.stripeCustomerId` for Stripe customer mapping. Add Stripe checkout, customer-portal and webhook routes before allowing self-serve subscriptions.

### Sending reminders

Connect an email provider such as Resend, then use a scheduled job to find `Reminder` records with `SCHEDULED` status. Log outcomes in the `Reminder` table and write an `AuditEvent` for all externally visible actions.

## Important launch notes

The dashboard data is intentionally sample UI data; it does not yet read or write the database. Authentication forms are also a visual scaffold. Do not use the current project to send real payment-chasing emails until authentication, authorisation, audit logging, consent workflows, email domain setup and legal/compliance review are implemented.

## Suggested next sprint

1. Complete registration/login and protect dashboard routes.
2. Build customer and invoice CRUD, starting with CSV import.
3. Replace dashboard sample data with scoped Prisma queries.
4. Add reminder rules, human approval and transactional email delivery.
5. Add AI draft generation and Stripe billing after the core workflow is validated.

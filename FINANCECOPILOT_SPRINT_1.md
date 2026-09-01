# FinanceCopilot Sprint 1

Working product name: **Cledra** (candidate only). Keep CreditPilot branding and production URLs unchanged until naming clearance and a deliberate launch decision.

## Reuse

- Auth.js credentials authentication, password recovery, company membership and tenant scoping.
- Prisma/PostgreSQL data layer and the existing Company, User, Customer, Invoice, Reminder, PaymentPromise, AIRecommendation and AuditEvent models.
- Customer, invoice, payment, reminder, statement and collections workflows.
- Responsive dashboard shell, sidebar, cards, tables, form styles and navy/electric-blue visual system.
- Server-side Finance AI foundation with deterministic answers when the external AI service is unavailable.
- Vercel build configuration, security headers and broken-promise scheduled job.

## Sprint 1 gaps

1. Make outstanding, overdue and due-this-week metrics date-correct and complete.
2. Surface customer risk in a focused Today's Action Centre.
3. Present the existing Copilot as a basic Ask Finance AI experience grounded in company-scoped data.
4. Verify authentication, tenant isolation, database migrations, production environment variables and the main dashboard-to-action flow before deployment.

## Explicitly deferred

- Supabase migration: the working beta already uses PostgreSQL through Prisma; replacing its auth/data layer is not required for the MVP.
- Irreversible Cledra rebrand, domain changes or redirects.
- Accounting-platform integrations, autonomous sending, complex forecasting, billing changes and new schema unless user testing proves they are necessary.

## MVP completion path

- Dashboard and Finance AI correctness changes.
- Lint, type-check and production build.
- Signed-in browser verification using representative invoice data.
- Preview deployment first; promote only after the CreditPilot beta flow passes smoke testing.

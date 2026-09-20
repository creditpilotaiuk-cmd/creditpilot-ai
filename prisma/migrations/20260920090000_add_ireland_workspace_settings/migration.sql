-- Additive Ireland B2B workspace settings. Existing workspaces remain UK/GBP.
ALTER TABLE "Company"
  ADD COLUMN "country" TEXT NOT NULL DEFAULT 'GB',
  ADD COLUMN "defaultCurrency" TEXT NOT NULL DEFAULT 'GBP',
  ADD COLUMN "businessUseConfirmedAt" TIMESTAMP(3),
  ADD COLUMN "bankIban" TEXT,
  ADD COLUMN "bankBic" TEXT;

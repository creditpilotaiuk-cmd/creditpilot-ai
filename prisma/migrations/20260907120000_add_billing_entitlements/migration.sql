ALTER TABLE "Company"
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "stripeSubscriptionStatus" TEXT;

CREATE UNIQUE INDEX "Company_stripeSubscriptionId_key" ON "Company"("stripeSubscriptionId");

CREATE TABLE "BillingEntitlement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingEntitlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingEntitlement_stripeSubscriptionId_key" ON "BillingEntitlement"("stripeSubscriptionId");
CREATE INDEX "BillingEntitlement_companyId_status_idx" ON "BillingEntitlement"("companyId", "status");

ALTER TABLE "BillingEntitlement"
  ADD CONSTRAINT "BillingEntitlement_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

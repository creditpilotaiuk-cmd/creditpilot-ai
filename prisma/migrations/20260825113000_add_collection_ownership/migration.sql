ALTER TABLE "Invoice"
ADD COLUMN "collectionOwnerId" TEXT,
ADD COLUMN "nextAction" TEXT,
ADD COLUMN "nextActionAt" TIMESTAMP(3),
ADD COLUMN "nextActionCompletedAt" TIMESTAMP(3);

CREATE INDEX "Invoice_companyId_nextActionAt_idx" ON "Invoice"("companyId", "nextActionAt");
CREATE INDEX "Invoice_collectionOwnerId_idx" ON "Invoice"("collectionOwnerId");

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_collectionOwnerId_fkey"
FOREIGN KEY ("collectionOwnerId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

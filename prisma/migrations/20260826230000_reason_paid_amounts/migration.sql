-- AlterTable
ALTER TABLE "Installment" ADD COLUMN "unassignedPaidAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "InstallmentReason" ADD COLUMN "paidAmount" INTEGER NOT NULL DEFAULT 0;

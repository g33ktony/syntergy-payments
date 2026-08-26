-- CreateTable
CREATE TABLE "InstallmentReason" (
    "id" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstallmentReason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstallmentReason_installmentId_idx" ON "InstallmentReason"("installmentId");

-- AddForeignKey
ALTER TABLE "InstallmentReason" ADD CONSTRAINT "InstallmentReason_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Installment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

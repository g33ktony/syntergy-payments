-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER');

-- AlterTable
ALTER TABLE "Person" ADD COLUMN "phone" TEXT;

-- AlterTable
ALTER TABLE "Installment" ADD COLUMN "paymentMethod" "PaymentMethod";

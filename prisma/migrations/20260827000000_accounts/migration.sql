-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- AlterTable
ALTER TABLE "Person" ADD COLUMN "accountId" TEXT;

-- CreateIndex
CREATE INDEX "Person_accountId_idx" ON "Person"("accountId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

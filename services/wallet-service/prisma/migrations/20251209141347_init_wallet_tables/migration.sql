/*
  Warnings:

  - You are about to drop the column `currency` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `dailyLimit` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `frozen` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `riskScore` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the `LedgerEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RiskProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletFlag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_walletId_fkey";

-- DropForeignKey
ALTER TABLE "WalletFlag" DROP CONSTRAINT "WalletFlag_walletId_fkey";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "currency",
DROP COLUMN "dailyLimit",
DROP COLUMN "frozen",
DROP COLUMN "riskScore",
ADD COLUMN     "locked" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "LedgerEntry";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "RiskProfile";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "WalletFlag";

-- CreateTable
CREATE TABLE "WalletLedger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLedger_pkey" PRIMARY KEY ("id")
);

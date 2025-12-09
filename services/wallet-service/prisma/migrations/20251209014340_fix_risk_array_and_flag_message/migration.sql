/*
  Warnings:

  - The `flags` column on the `RiskProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RiskProfile" DROP COLUMN "flags",
ADD COLUMN     "flags" TEXT[];

-- AlterTable
ALTER TABLE "WalletFlag" ADD COLUMN     "message" TEXT;

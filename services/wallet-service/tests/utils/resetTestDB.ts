import { prisma } from "../../src/prisma";

export async function resetTestDB() {
  const tables = [
    "WalletFlag",
    "Transaction",
    "LedgerEntry",
    "RiskProfile",
    "Wallet"
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}" CASCADE;`);
  }
}

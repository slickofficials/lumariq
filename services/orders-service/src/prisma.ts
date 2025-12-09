// src/prisma.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Optional: helper to sanity-check DB connection on startup
export async function assertDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[orders-service] ✅ Connected to Postgres");
  } catch (err) {
    console.error("[orders-service] ❌ Failed to connect to Postgres", err);
    throw err;
  }
}
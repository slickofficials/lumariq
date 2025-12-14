import { Router } from "express";
import { prisma } from "../prisma";

export const revenueRouter = Router();

// Simple daily revenue rollup from FeeLedgerEntry
revenueRouter.get("/daily", async (req, res) => {
  try {
    const days = req.query.days ? Math.min(90, Math.max(1, Number(req.query.days))) : 30;

    // Postgres date_trunc rollup
    const rows = await prisma.$queryRaw<
      { day: string; total_fee: number; entries: number }[]
    >`
      SELECT
        to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as day,
        SUM("feeAmount")::float as total_fee,
        COUNT(*)::int as entries
      FROM "FeeLedgerEntry"
      WHERE "createdAt" >= NOW() - (${days} || ' days')::interval
      GROUP BY 1
      ORDER BY 1 DESC
    `;

    return res.json({ days, rows });
  } catch (err) {
    console.error("revenue error:", err);
    return res.status(500).json({ error: "Revenue query failed" });
  }
});

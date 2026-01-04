import { Express } from "express";
import { releaseRegionalLock } from "./shockWorker";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function setupAdminRoutes(app: Express) {
  // L3 Agent Endpoint: Get status of all regional locks
  app.get("/admin/grid-status", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM regional_locks ORDER BY region_id ASC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Database unreachable" });
    }
  });

  // L3 Agent Endpoint: Surgical Release (Human Override #494)
  app.post("/admin/release-lock", async (req, res) => {
    const { adminId, regionId } = req.body;
    
    if (!regionId) {
      return res.status(400).json({ error: "Missing regionId (e.g., AF-NGA)" });
    }

    console.log(`👤 HUMAN OVERRIDE: Admin ${adminId} releasing lock for ${regionId}`);
    
    try {
      await releaseRegionalLock(regionId);
      res.json({ status: "SUCCESS", message: `Sector ${regionId} unlocked by CTO.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}

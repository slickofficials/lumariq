import { Pool } from "pg";
import { pushEvent } from "./stream";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://lumariq:lumariq@localhost:5432/dispatch",
});

// Track stability per region
const regionalStability: Record<string, number> = {};
const STABILITY_THRESHOLD = 5;

export async function processSurgeSignal(hexId: string, surgeMultiplier: number) {
  // Extract Region (e.g., AF-NGA-LAG-001 -> AF-NGA)
  const regionId = hexId.split('-').slice(0, 2).join('-');
  const isLocked = await checkRegionalLockStatus(regionId);

  if (surgeMultiplier >= 2.5) {
    regionalStability[regionId] = 0;
    if (!isLocked) {
      console.log(`🚨 REGIONAL SHOCK: ${regionId} at ${surgeMultiplier}x. Locking Sector.`);
      await triggerRegionalLock(regionId, hexId, surgeMultiplier);
    }
  } else if (surgeMultiplier < 1.5 && isLocked) {
    regionalStability[regionId] = (regionalStability[regionId] || 0) + 1;
    console.log(`🌱 REGION ${regionId} STABILITY: ${regionalStability[regionId]}/${STABILITY_THRESHOLD}`);
    
    if (regionalStability[regionId] >= STABILITY_THRESHOLD) {
      console.log(`♻️ REGIONAL HEAL: ${regionId} stabilized. Releasing...`);
      await releaseRegionalLock(regionId);
      regionalStability[regionId] = 0;
    }
  }
}

async function checkRegionalLockStatus(regionId: string): Promise<boolean> {
  const res = await pool.query("SELECT locked FROM regional_locks WHERE region_id = $1", [regionId]);
  return res.rows[0]?.locked || false;
}

async function triggerRegionalLock(regionId: string, hexId: string, value: number) {
  try {
    await pool.query(
      "UPDATE regional_locks SET locked = true, reason = $1, updated_at = NOW() WHERE region_id = $2",
      [`SURGE_SHOCK: ${value}x in ${hexId}`, regionId]
    );
    pushEvent({ type: "REGIONAL_LOCK", payload: { regionId, hexId, multiplier: value } });
  } catch (err) {
    console.error(`❌ ${regionId} LOCK FAILED:`, err);
  }
}

export async function releaseRegionalLock(regionId: string) {
  try {
    await pool.query(
      "UPDATE regional_locks SET locked = false, reason = 'Stabilized', updated_at = NOW() WHERE region_id = $1",
      [regionId]
    );
    pushEvent({ type: "REGIONAL_RELEASE", payload: { regionId, status: "ACTIVE" } });
  } catch (err) {
    console.error(`❌ ${regionId} RELEASE FAILED:`, err);
  }
}

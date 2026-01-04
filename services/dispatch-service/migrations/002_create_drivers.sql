CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    vehicle_type TEXT,
    vehicle_plate TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    available BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS drivers_location_idx
ON drivers USING GIST (geography(ST_MakePoint(lng, lat)));
CREATE TABLE IF NOT EXISTS revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_ride ON revenue(ride_id);
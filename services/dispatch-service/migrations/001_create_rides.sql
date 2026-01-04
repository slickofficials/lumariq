CREATE TABLE IF NOT EXISTS rides (
    id           BIGSERIAL PRIMARY KEY,
    passenger_id VARCHAR(64) NOT NULL,
    driver_id    VARCHAR(64),
    pickup_lat   DOUBLE PRECISION NOT NULL,
    pickup_lng   DOUBLE PRECISION NOT NULL,
    dropoff_lat  DOUBLE PRECISION NOT NULL,
    dropoff_lng  DOUBLE PRECISION NOT NULL,
    status       VARCHAR(32) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_passenger_status
    ON rides (passenger_id, status);

CREATE INDEX IF NOT EXISTS idx_rides_driver_status
    ON rides (driver_id, status);
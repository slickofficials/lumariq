package storage

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func AutoMigrate(pool *pgxpool.Pool) error {
	ctx := context.Background()

	migrations := []string{
		// 🔹 Drivers Table
		`
		CREATE TABLE IF NOT EXISTS drivers (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			vehicle_type TEXT NOT NULL,
			vehicle_plate TEXT NOT NULL,
			lat DOUBLE PRECISION NOT NULL,
			lng DOUBLE PRECISION NOT NULL,
			available BOOLEAN NOT NULL DEFAULT TRUE,
			wallet_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
			total_rides INTEGER NOT NULL DEFAULT 0,
			updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
			brand TEXT DEFAULT 'Unknown',
			model TEXT DEFAULT 'Standard',
			color TEXT DEFAULT 'Unknown',
			year INTEGER DEFAULT 2015,
			rating DOUBLE PRECISION DEFAULT 5.0,
			rating_sum DOUBLE PRECISION DEFAULT 0,
			rating_count INTEGER DEFAULT 0,
			tier TEXT DEFAULT 'Bronze',
			level INTEGER DEFAULT 1,
			avatar_url TEXT DEFAULT ''
		);
		`,

		// 🔹 Rides Table
		`
		CREATE TABLE IF NOT EXISTS rides (
			id TEXT PRIMARY KEY,
			passenger_id TEXT NOT NULL,
			driver_id TEXT,
			pickup_lat DOUBLE PRECISION,
			pickup_lng DOUBLE PRECISION,
			dropoff_lat DOUBLE PRECISION,
			dropoff_lng DOUBLE PRECISION,
			distance_km DOUBLE PRECISION DEFAULT 0,
			fare DOUBLE PRECISION DEFAULT 0,
			currency TEXT DEFAULT 'NGN',
			status TEXT DEFAULT 'requested',
			requested_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW(),
			trip_end_at TIMESTAMP,
			completed_at TIMESTAMP,
			rated BOOLEAN DEFAULT FALSE
		);
		`,

		// 🔹 Revenue Table
		`
		CREATE TABLE IF NOT EXISTS lumariq_revenue (
			id SERIAL PRIMARY KEY,
			ride_id TEXT NOT NULL,
			driver_id TEXT NOT NULL,
			revenue_amount DOUBLE PRECISION NOT NULL,
			created_at TIMESTAMP DEFAULT NOW()
		);
		`,

		// 🔹 Upgrades: ensure columns exist (safe migrations)
		`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS rating_sum DOUBLE PRECISION DEFAULT 0;`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION;`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION;`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS dropoff_lat DOUBLE PRECISION;`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS dropoff_lng DOUBLE PRECISION;`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS trip_end_at TIMESTAMP;`,
		`ALTER TABLE rides ADD COLUMN IF NOT EXISTS rated BOOLEAN DEFAULT FALSE;`,
	}

	for _, m := range migrations {
		_, err := pool.Exec(ctx, m)
		if err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	log.Println("📌 Auto-migrate: drivers, rides & revenue tables OK")
	return nil
}
package main

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	db, err := pgxpool.New(context.Background(), "postgres://lumariq:lumariq@postgres:5432/dispatch")
	if err != nil {
		log.Fatal(err)
	}

	for {
		_, err := db.Exec(context.Background(), `
			UPDATE surge_zones
			SET surge_multiplier = (
				SELECT surge_multiplier FROM surge_state WHERE zone_id = surge_zones.zone_id
			),
			updated_at = NOW()
		`)
		if err != nil {
			log.Println("surge update failed:", err)
		}

		time.Sleep(10 * time.Second)
	}
}
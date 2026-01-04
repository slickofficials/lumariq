package storage

import (
	"context"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectPostgres() (*pgxpool.Pool, error) {
	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		// Local docker default
		connString = "postgres://lumariq:lumariq@postgres:5432/dispatch?sslmode=disable"
	}

	cfg, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, err
	}

	cfg.MaxConns = 10
	cfg.MinConns = 2
	cfg.HealthCheckPeriod = 30 * time.Second

	pool, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		return nil, err
	}

	return pool, nil
}

func NewRideRepository(pool *pgxpool.Pool) *PostgresRideRepository {
	return &PostgresRideRepository{pool: pool}
}

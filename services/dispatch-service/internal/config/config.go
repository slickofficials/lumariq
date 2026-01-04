package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lumariq/dispatch-service/internal/storage"
)

type AppConfig struct {
	DB      *pgxpool.Pool
	Rides   storage.RideRepository
	Drivers storage.DriverRepository
}

// Init initializes the application configuration, sets up the database connection,
// ensures the target database exists, runs migrations, and wires repositories.
func Init() (*AppConfig, error) {
	dsn := os.Getenv("DISPATCH_DATABASE_URL")
	if dsn == "" {
		host := getenvDefault("DISPATCH_DB_HOST", "postgres")
		port := getenvDefault("DISPATCH_DB_PORT", "5432")
		user := getenvDefault("DISPATCH_DB_USER", "lumariq")
		pass := getenvDefault("DISPATCH_DB_PASS", "lumariq")
		name := getenvDefault("DISPATCH_DB_NAME", "dispatch")

		// Ensure target database exists by connecting to default "postgres"
		adminDSN := fmt.Sprintf("postgres://%s:%s@%s:%s/postgres?sslmode=disable", user, pass, host, port)
		adminPool, err := pgxpool.New(context.Background(), adminDSN)
		if err == nil {
			var exists bool
			_ = adminPool.QueryRow(context.Background(),
				"SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname=$1)", name).Scan(&exists)

			if !exists {
				_, _ = adminPool.Exec(context.Background(), "CREATE DATABASE "+name)
				log.Println("🟢 Created database:", name)
			}
			adminPool.Close()
		}

		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, pass, host, port, name)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.New: %w", err)
	}

	// Retry ping until Postgres is ready
	for attempts := 1; attempts <= 20; attempts++ {
		if err := pool.Ping(ctx); err == nil {
			break
		}
		log.Printf("⏳ Waiting for Postgres… %d/20", attempts)
		time.Sleep(3 * time.Second)
	}

	// Run migrations
	if err := storage.AutoMigrate(pool); err != nil {
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	cfg := &AppConfig{
		DB:      pool,
		Rides:   storage.NewPostgresRideRepository(pool),
		Drivers: storage.NewPostgresDriverRepository(pool),
	}

	log.Println("🚀 dispatch-service ready!")
	return cfg, nil
}

// getenvDefault returns the environment variable value or a default if unset.
func getenvDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
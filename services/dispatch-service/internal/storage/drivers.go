package storage

import (
	"context"
	"time"
    "log"
	"github.com/jackc/pgx/v5/pgxpool"
)

/* =========================
   DRIVER MODEL
========================= */

type Driver struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	VehicleType   string    `json:"vehicleType"`
	VehiclePlate  string    `json:"vehiclePlate"`
	Lat           float64   `json:"lat"`
	Lng           float64   `json:"lng"`
	Available     bool      `json:"available"`
	WalletBalance float64   `json:"walletBalance"`
	TotalRides    int       `json:"totalRides"`
	UpdatedAt     time.Time `json:"updatedAt"`

	Brand string `json:"brand"`
	Model string `json:"model"`
	Color string `json:"color"`
	Year  int    `json:"year"`

	Rating      float64 `json:"rating"`
	RatingCount int     `json:"ratingCount"`
	TrustScore  float64 `json:"trustScore"`

	Tier  string `json:"tier"`
	Level int    `json:"level"`

	AvatarURL string `json:"avatarUrl"`
}

/* =========================
   REPOSITORY INTERFACE
========================= */

type DriverRepository interface {
	RegisterDriver(ctx context.Context, d *Driver) error
	UpdateLocation(ctx context.Context, id string, lat, lng float64) error
	SetAvailable(ctx context.Context, id string, available bool) error

	FindNearest(ctx context.Context, lat, lng float64) (*Driver, error)
	GetDriverByID(ctx context.Context, id string) (*Driver, error)

	UpdateRating(ctx context.Context, id string, rating float64) (*Driver, error)
}

/* =========================
   POSTGRES IMPLEMENTATION
========================= */

type PostgresDriverRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresDriverRepository(pool *pgxpool.Pool) *PostgresDriverRepository {
	return &PostgresDriverRepository{pool: pool}
}

/* =========================
   DRIVER REGISTRATION
========================= */

func (r *PostgresDriverRepository) RegisterDriver(
	ctx context.Context,
	d *Driver,
) error {

	if !d.Available {
		d.Available = true
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO drivers (
			id, name, vehicle_type, vehicle_plate,
			lat, lng, available,
			brand, model, color, year,
			rating, rating_count, rating_sum,
			cancelled_rides, complaints,
			trust_score, tier, level,
			avatar_url, updated_at
		)
		VALUES (
			$1,$2,$3,$4,
			$5,$6,$7,
			$8,$9,$10,$11,
			5.0,0,0,
			0,0,
			1.0,'Bronze',1,
			$12,NOW()
		)
		ON CONFLICT (id) DO NOTHING;
	`,
		d.ID,
		d.Name,
		d.VehicleType,
		d.VehiclePlate,
		d.Lat,
		d.Lng,
		d.Available,
		d.Brand,
		d.Model,
		d.Color,
		d.Year,
		d.AvatarURL,
	)

	return err
}

/* =========================
   LOCATION & AVAILABILITY
========================= */

func (r *PostgresDriverRepository) UpdateLocation(
	ctx context.Context,
	id string,
	lat, lng float64,
) error {

	_, err := r.pool.Exec(ctx, `
		UPDATE drivers
		SET lat=$1, lng=$2, updated_at=NOW()
		WHERE id=$3
	`, lat, lng, id)

	return err
}

func (r *PostgresDriverRepository) SetAvailable(
	ctx context.Context,
	id string,
	available bool,
) error {

	_, err := r.pool.Exec(ctx, `
		UPDATE drivers
		SET available=$1, updated_at=NOW()
		WHERE id=$2
	`, available, id)

	return err
}

/* =========================
   SMART RATING + TRUST
========================= */

func (r *PostgresDriverRepository) UpdateRating(
	ctx context.Context,
	driverID string,
	newRating float64,
) (*Driver, error) {

	// Clamp rating
	if newRating < 1 {
		newRating = 1
	}
	if newRating > 5 {
		newRating = 5
	}

	row := r.pool.QueryRow(ctx, `
		UPDATE drivers
		SET
			-- Rating decay (recent rides matter more)
			rating_sum   = (rating_sum * 0.90) + $2,
			rating_count = rating_count + 1,

			-- Weighted rating
			rating = LEAST(5.0, GREATEST(1.0,
				((rating_sum * 0.90) + $2) / (rating_count + 1)
			)),

			-- Trust score (authoritative)
			trust_score = LEAST(1.0, GREATEST(0.0,
				(
					(((rating_sum * 0.90) + $2) / (rating_count + 1)) / 5.0
				)
				- (cancelled_rides * 0.05)
				- (complaints * 0.10)
			)),

			-- Tiering
			tier = CASE
				WHEN rating_count + 1 >= 500 AND rating >= 4.9 THEN 'Diamond'
				WHEN rating_count + 1 >= 200 AND rating >= 4.8 THEN 'Platinum'
				WHEN rating_count + 1 >= 50  AND rating >= 4.5 THEN 'Gold'
				WHEN rating_count + 1 >= 20  AND rating >= 4.2 THEN 'Silver'
				ELSE 'Bronze'
			END,

			level = CASE
				WHEN rating_count + 1 >= 500 THEN 5
				WHEN rating_count + 1 >= 200 THEN 4
				WHEN rating_count + 1 >= 50  THEN 3
				WHEN rating_count + 1 >= 20  THEN 2
				ELSE 1
			END,

			updated_at = NOW()
		WHERE id = $1
		RETURNING
			id,
			name,
			vehicle_type,
			vehicle_plate,
			lat,
			lng,
			available,
			wallet_balance,
			total_rides,
			updated_at,
			brand,
			model,
			color,
			year,
			rating,
			rating_count,
			trust_score,
			tier,
			level,
			avatar_url;
	`, driverID, newRating)

	var d Driver
	if err := row.Scan(
		&d.ID,
		&d.Name,
		&d.VehicleType,
		&d.VehiclePlate,
		&d.Lat,
		&d.Lng,
		&d.Available,
		&d.WalletBalance,
		&d.TotalRides,
		&d.UpdatedAt,
		&d.Brand,
		&d.Model,
		&d.Color,
		&d.Year,
		&d.Rating,
		&d.RatingCount,
		&d.TrustScore,
		&d.Tier,
		&d.Level,
		&d.AvatarURL,
	); err != nil {
		return nil, err
	}

	return &d, nil
}

/* =========================
   SMART-BID DRIVER PICK
========================= */

func (r *PostgresDriverRepository) FindNearest(
	ctx context.Context,
	lat, lng float64,
) (*Driver, error) {

	d := &Driver{}

	err := r.pool.QueryRow(ctx, `
		SELECT
			id,
			name,
			vehicle_type,
			vehicle_plate,
			lat,
			lng,
			available,
			wallet_balance,
			total_rides,
			updated_at,
			brand,
			model,
			color,
			year,
			rating,
			rating_count,
			trust_score,
			tier,
			level,
			COALESCE(avatar_url, '')
		FROM drivers
		WHERE available = TRUE
		  AND trust_score >= 0.35
		ORDER BY
        (
           ((lat - $1)*(lat - $1) + (lng - $2)*(lng - $2))
           * (1.0 / GREATEST(
           (SELECT effective_trust FROM driver_effective_trust WHERE id = drivers.id),
            0.30
           ))
        ) ASC
		LIMIT 1
	`, lat, lng).Scan(
		&d.ID,
		&d.Name,
		&d.VehicleType,
		&d.VehiclePlate,
		&d.Lat,
		&d.Lng,
		&d.Available,
		&d.WalletBalance,
		&d.TotalRides,
		&d.UpdatedAt,
		&d.Brand,
		&d.Model,
		&d.Color,
		&d.Year,
		&d.Rating,
		&d.RatingCount,
		&d.TrustScore,
		&d.Tier,
		&d.Level,
		&d.AvatarURL,
	)

	if err != nil {
		// 🔎 Debug log for errors
		log.Printf("[SMART-BID] No driver found near (%.4f, %.4f): %v", lat, lng, err)
		return nil, err
	}

	// ✅ Debug log for successful selection
	log.Printf("[SMART-BID] Selected driver: %s (%s) trust=%.2f tier=%s",
		d.ID, d.Name, d.TrustScore, d.Tier)

	return d, nil
}

/* =========================
   DRIVER PROFILE
========================= */

func (r *PostgresDriverRepository) GetDriverByID(
	ctx context.Context,
	driverID string,
) (*Driver, error) {

	row := r.pool.QueryRow(ctx, `
		SELECT
			id,
			name,
			vehicle_type,
			vehicle_plate,
			lat,
			lng,
			available,
			wallet_balance,
			total_rides,
			updated_at,
			brand,
			model,
			color,
			year,
			rating,
			rating_count,
			trust_score,
			tier,
			level,
			COALESCE(avatar_url, '')
		FROM drivers
		WHERE id=$1
	`, driverID)

	var d Driver
	err := row.Scan(
		&d.ID,
		&d.Name,
		&d.VehicleType,
		&d.VehiclePlate,
		&d.Lat,
		&d.Lng,
		&d.Available,
		&d.WalletBalance,
		&d.TotalRides,
		&d.UpdatedAt,
		&d.Brand,
		&d.Model,
		&d.Color,
		&d.Year,
		&d.Rating,
		&d.RatingCount,
		&d.TrustScore,
		&d.Tier,
		&d.Level,
		&d.AvatarURL,
	)
	if err != nil {
		return nil, err
	}

	return &d, nil
}
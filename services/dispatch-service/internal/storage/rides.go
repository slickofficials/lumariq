package storage

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RideStatus string

const (
	RideStatusQueued    RideStatus = "queued"
	RideStatusAssigned  RideStatus = "assigned"
	RideStatusCompleted RideStatus = "completed"
)

type Ride struct {
	ID          string     `json:"rideId"`
	PassengerID string     `json:"passengerId"`
	DriverID    string     `json:"driverId,omitempty"`
	PickupLat   float64    `json:"pickupLat"`
	PickupLng   float64    `json:"pickupLng"`
	DropoffLat  float64    `json:"dropoffLat"`
	DropoffLng  float64    `json:"dropoffLng"`
	DistanceKm  float64    `json:"distanceKm"`
	Fare        float64    `json:"fare"`
	Status      RideStatus `json:"status"`
	RequestedAt time.Time  `json:"requestedAt"`
}

type RideRepository interface {
	CreateRide(ctx context.Context, ride *Ride) error
	AssignDriver(ctx context.Context, rideID, driverID string) error
	CompleteRide(ctx context.Context, rideID, driverID string) error
	GetRideByID(ctx context.Context, rideID string) (*Ride, error)

	CreateRideWithPricing(ctx context.Context, ride *Ride, driverID string) error

	// ⭐ One-time passenger rating (atomic)
	RateRideOnce(
		ctx context.Context,
		rideID string,
		driverID string,
		rating float64,
		driverRepo DriverRepository,
	) (*Driver, error)
}

type PostgresRideRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRideRepository(pool *pgxpool.Pool) *PostgresRideRepository {
	return &PostgresRideRepository{pool: pool}
}

var (
	ErrRideNotFound = errors.New("ride_not_found")
)

func (r *PostgresRideRepository) CreateRide(ctx context.Context, ride *Ride) error {
	ride.ID = uuid.NewString()
	ride.Status = RideStatusQueued

	return r.pool.QueryRow(ctx, `
        INSERT INTO rides (
            id, passenger_id,
            pickup_lat, pickup_lng,
            dropoff_lat, dropoff_lng,
            status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING requested_at
    `,
		ride.ID,
		ride.PassengerID,
		ride.PickupLat, ride.PickupLng,
		ride.DropoffLat, ride.DropoffLng,
		ride.Status,
	).Scan(&ride.RequestedAt)
}

func (r *PostgresRideRepository) CreateRideWithPricing(ctx context.Context, ride *Ride, driverID string) error {
	ride.ID = uuid.NewString()
	ride.Status = RideStatusAssigned

	return r.pool.QueryRow(ctx, `
        INSERT INTO rides (
            id, passenger_id, driver_id,
            pickup_lat, pickup_lng,
            dropoff_lat, dropoff_lng,
            distance_km, fare,
            status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING requested_at
    `,
		ride.ID,
		ride.PassengerID,
		driverID,
		ride.PickupLat, ride.PickupLng,
		ride.DropoffLat, ride.DropoffLng,
		ride.DistanceKm,
		ride.Fare,
		ride.Status,
	).Scan(&ride.RequestedAt)
}

func (r *PostgresRideRepository) AssignDriver(ctx context.Context, rideID, driverID string) error {
	cmdTag, err := r.pool.Exec(ctx, `
		UPDATE rides
		SET driver_id = $1,
		    status = $2
		WHERE id = $3
	`,
		driverID, RideStatusAssigned, rideID,
	)

	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return ErrRideNotFound
	}
	return nil
}

func (r *PostgresRideRepository) CompleteRide(ctx context.Context, rideID, driverID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1️⃣ Fetch fare
	var fare float64
	err = tx.QueryRow(ctx, `SELECT fare FROM rides WHERE id=$1`, rideID).Scan(&fare)
	if err != nil {
		return err
	}

	// 2️⃣ Update ride record
	_, err = tx.Exec(ctx, `
        UPDATE rides
        SET status = $1,
            driver_id = $2,
            trip_end_at = NOW(),
            updated_at = NOW()
        WHERE id = $3
    `, RideStatusCompleted, driverID, rideID)
	if err != nil {
		return err
	}

	// 3️⃣ Pay driver 85%
	_, err = tx.Exec(ctx, `
        UPDATE drivers
        SET wallet_balance = wallet_balance + $1,
            total_rides = total_rides + 1,
            updated_at = NOW()
        WHERE id = $2
    `, fare*0.85, driverID)
	if err != nil {
		return err
	}

	// 4️⃣ Insert Lumariq revenue log 15%
	_, err = tx.Exec(ctx, `
        INSERT INTO lumariq_revenue (ride_id, driver_id, revenue_amount)
        VALUES ($1, $2, $3)
    `, rideID, driverID, fare*0.15)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *PostgresRideRepository) GetRideByID(ctx context.Context, rideID string) (*Ride, error) {
	ride := &Ride{}

	err := r.pool.QueryRow(ctx, `
		SELECT
			id,
			passenger_id,
			driver_id,
			pickup_lat,
			pickup_lng,
			dropoff_lat,
			dropoff_lng,
			status,
			requested_at
		FROM rides
		WHERE id = $1
	`, rideID).Scan(
		&ride.ID,
		&ride.PassengerID,
		&ride.DriverID,
		&ride.PickupLat,
		&ride.PickupLng,
		&ride.DropoffLat,
		&ride.DropoffLng,
		&ride.Status,
		&ride.RequestedAt,
	)

	if err != nil {
		return nil, ErrRideNotFound
	}

	return ride, nil
}

func (r *PostgresRideRepository) RateRideOnce(
	ctx context.Context,
	rideID string,
	driverID string,
	rating float64,
	driverRepo DriverRepository,
) (*Driver, error) {

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var status string
	var rated bool

	// 🔒 Lock ride row
	err = tx.QueryRow(ctx, `
		SELECT status, rated
		FROM rides
		WHERE id = $1 AND driver_id = $2
		FOR UPDATE
	`, rideID, driverID).Scan(&status, &rated)

	if err != nil {
		return nil, err
	}

	if status != string(RideStatusCompleted) {
		return nil, errors.New("ride_not_completed")
	}

	if rated {
		return nil, errors.New("ride_already_rated")
	}

	// ✅ Mark ride as rated
	_, err = tx.Exec(ctx, `
		UPDATE rides
		SET rated = true,
		    updated_at = NOW()
		WHERE id = $1
	`, rideID)
	if err != nil {
		return nil, err
	}

	// 🌟 Update driver reputation
	driver, err := driverRepo.UpdateRating(ctx, driverID, rating)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return driver, nil
}
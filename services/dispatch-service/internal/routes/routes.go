package routes

import (
	"context"
	"errors"
	"log"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"github.com/lumariq/dispatch-service/internal/config"
	"github.com/lumariq/dispatch-service/internal/pricing"
	"github.com/lumariq/dispatch-service/internal/storage"
)

func Register(
	router *gin.Engine,
	cfg *config.AppConfig,
	rideRepo storage.RideRepository,
	driverRepo storage.DriverRepository,
) {

	// =========================
	// HEALTH
	// =========================
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// =========================
	// DRIVER REGISTRATION
	// =========================
	router.POST("/dispatch/api/driver/register", func(c *gin.Context) {
		var req storage.Driver
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.ID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "driverId (id) is required"})
			return
		}

		if err := driverRepo.RegisterDriver(context.Background(), &req); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":   "registered",
			"driverId": req.ID,
		})
	})

	// =========================
	// DRIVER AVAILABILITY
	// =========================
	router.PATCH("/dispatch/api/driver/available", func(c *gin.Context) {
		var req struct {
			DriverID  string `json:"driverId"`
			Available bool   `json:"available"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := driverRepo.SetAvailable(context.Background(), req.DriverID, req.Available); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"driverId":  req.DriverID,
			"available": req.Available,
		})
	})

	// =========================
	// DRIVER PROFILE
	// =========================
	router.GET("/dispatch/api/driver/profile/:id", func(c *gin.Context) {
		driver, err := driverRepo.GetDriverByID(context.Background(), c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "driver_not_found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"driver": driver})
	})

	// =========================
	// SMART-BID RIDE REQUEST
	// =========================
	router.POST("/dispatch/api/ride/smart-bid", func(c *gin.Context) {
		var req struct {
			PassengerID string  `json:"passengerId"`
			PickupLat   float64 `json:"pickupLat"`
			PickupLng   float64 `json:"pickupLng"`
			DropoffLat  float64 `json:"dropoffLat"`
			DropoffLng  float64 `json:"dropoffLng"`
			MaxPrice    float64 `json:"maxPrice"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx := context.Background()
		distanceKm := haversineKm(req.PickupLat, req.PickupLng, req.DropoffLat, req.DropoffLng)
		finalPrice := pricing.EstimateFare(distanceKm)

		if req.MaxPrice > 0 && finalPrice > req.MaxPrice {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":          "max_price_too_low",
				"suggestedPrice": finalPrice,
				"currency":       "NGN",
			})
			return
		}

		driver, err := driverRepo.FindNearest(ctx, req.PickupLat, req.PickupLng)
		if err != nil {

			// 🚫 No eligible drivers (shadow-ban / none nearby)
			if errors.Is(err, pgx.ErrNoRows) {
				log.Printf("[SMART-BID] No eligible drivers passenger=%s", req.PassengerID)
				c.JSON(http.StatusOK, gin.H{
					"error":          "no_nearby_drivers",
					"suggestedPrice": finalPrice,
					"currency":       "NGN",
				})
				return
			}

			log.Printf("[SMART-BID] DB error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error"})
			return
		}

		log.Printf(
			"[SMART-BID] Driver=%s trust=%.2f tier=%s → passenger=%s",
			driver.ID, driver.TrustScore, driver.Tier, req.PassengerID,
		)

		ride := &storage.Ride{
			PassengerID: req.PassengerID,
			PickupLat:   req.PickupLat,
			PickupLng:   req.PickupLng,
			DropoffLat:  req.DropoffLat,
			DropoffLng:  req.DropoffLng,
			Fare:        finalPrice,
			DistanceKm:  distanceKm,
		}

		if err := rideRepo.CreateRideWithPricing(ctx, ride, driver.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		_ = driverRepo.SetAvailable(ctx, driver.ID, false)

		c.JSON(http.StatusAccepted, gin.H{
			"status":        "assigned",
			"rideId":        ride.ID,
			"driver":        driver,
			"distanceKm":    distanceKm,
			"price":         finalPrice,
			"currency":      "NGN",
			"pricingEngine": "lumariq-smart-bid-v1",
		})
	})

	// =========================
	// COMPLETE RIDE
	// =========================
	router.POST("/dispatch/api/ride/complete", func(c *gin.Context) {
		var req struct {
			RideID   string `json:"rideId"`
			DriverID string `json:"driverId"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := rideRepo.CompleteRide(context.Background(), req.RideID, req.DriverID); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		_ = driverRepo.SetAvailable(context.Background(), req.DriverID, true)

		c.JSON(http.StatusOK, gin.H{"status": "completed"})
	})

	// =========================
	// RATE DRIVER (ONCE)
	// =========================
	router.POST("/dispatch/api/ride/rate", func(c *gin.Context) {
		var req struct {
			RideID   string  `json:"rideId"`
			DriverID string  `json:"driverId"`
			Rating   float64 `json:"rating"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		driver, err := rideRepo.RateRideOnce(
			context.Background(),
			req.RideID,
			req.DriverID,
			req.Rating,
			driverRepo,
		)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status": "rated",
			"driver": driver,
		})
	})
}

// =========================
// HAVERSINE DISTANCE (KM)
// =========================
func haversineKm(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371.0

	rad := func(d float64) float64 { return d * math.Pi / 180 }

	dLat := rad(lat2 - lat1)
	dLng := rad(lng2 - lng1)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(rad(lat1))*math.Cos(rad(lat2))*
			math.Sin(dLng/2)*math.Sin(dLng/2)

	return R * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}
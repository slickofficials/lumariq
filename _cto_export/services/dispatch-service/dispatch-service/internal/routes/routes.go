package routes

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

func Register(r *gin.Engine) {
    r.GET("/healthz", healthHandler)

    api := r.Group("/api/dispatch")
    {
        api.POST("/request-ride", requestRideHandler)
    }
}

func healthHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "status": "ok",
        "ts":     time.Now().UTC(),
    })
}

type RequestRideInput struct {
    PassengerID string  `json:"passengerId" binding:"required"`
    PickupLat   float64 `json:"pickupLat" binding:"required"`
    PickupLng   float64 `json:"pickupLng" binding:"required"`
    DropoffLat  float64 `json:"dropoffLat" binding:"required"`
    DropoffLng  float64 `json:"dropoffLng" binding:"required"`
}

func requestRideHandler(c *gin.Context) {
    var input RequestRideInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": err.Error(),
        })
        return
    }

    rideID := "demo-" + time.Now().Format("20060102150405")

    c.JSON(http.StatusAccepted, gin.H{
        "rideId": rideID,
        "status": "queued",
    })
}
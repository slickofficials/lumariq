package pricing

import "math"

// Super simple NGN pricing engine for now.
// Later we can pull these from config / dynamic rules.
const (
	basePickupNGN = 400.0  // base flag fee
	perKmNGN      = 250.0  // per KM
	minFareNGN    = 700.0  // minimum fare
)

// EstimateFare returns a rounded NGN estimate for a given distance in KM.
func EstimateFare(distanceKm float64) float64 {
	fare := basePickupNGN + perKmNGN*distanceKm
	if fare < minFareNGN {
		fare = minFareNGN
	}

	// Round to nearest 10 NGN to look neat.
	return math.Round(fare/10.0) * 10.0
}
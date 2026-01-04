func ScoreDriver(
	distanceKm,
	acceptanceRate,
	rating,
	experience,
	trustScore float64,
) float64 {
	return (1/(distanceKm+0.01))*0.50 + 
	       (acceptanceRate * 0.30) + 
	       (trustScore * 0.20) + 
	       (experience * 0.05)
}
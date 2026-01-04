package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type HexStat struct {
	HexID            string
	ActiveRides      int
	AvailableDrivers int
	AvgTrust         float64
	CostIndex        float64
}

type MLRequest struct {
	Rating          float64 `json:"rating"`
	RatingCount     int     `json:"rating_count"`
	CancelledRides  int     `json:"cancelled_rides"`
	Complaints      int     `json:"complaints"`
	FraudScore      float64 `json:"fraud_score"`
}

type MLResponse struct {
	MLTrust float64 `json:"ml_trust"`
}

func main() {
	db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}

	for {
		runSurgeCycle(db)
		time.Sleep(5 * time.Second) // LIVE recalculation
	}
}

func runSurgeCycle(db *sql.DB) {
	rows, err := db.Query(`
		SELECT hex_id, active_rides, available_drivers, avg_trust, cost_index
		FROM geo_hex_stats
	`)
	if err != nil {
		log.Println(err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var h HexStat
		rows.Scan(&h.HexID, &h.ActiveRides, &h.AvailableDrivers, &h.AvgTrust, &h.CostIndex)

		trust := callMLTrust(h)

		surge := calculateSurge(h, trust)

		_, _ = db.Exec(`
			UPDATE geo_hex_stats
			SET avg_trust=$1, cost_index=$2, updated_at=NOW()
			WHERE hex_id=$3
		`, trust, surge, h.HexID)
	}
}

func callMLTrust(h HexStat) float64 {
	req := MLRequest{
		Rating:         h.AvgTrust * 5,
		RatingCount:    100,
		CancelledRides: 1,
		Complaints:     0,
		FraudScore:     0.05,
	}

	body, _ := json.Marshal(req)
	resp, err := http.Post(
		"http://ml-trust:8000/predict",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return 0.5
	}
	defer resp.Body.Close()

	var out MLResponse
	json.NewDecoder(resp.Body).Decode(&out)
	return out.MLTrust
}

func calculateSurge(h HexStat, trust float64) float64 {
	if h.AvailableDrivers == 0 {
		return 3.0
	}

	demandPressure := float64(h.ActiveRides) / float64(h.AvailableDrivers)
	trustPenalty := 1.2 - trust

	surge := 1 + (demandPressure * trustPenalty)
	if surge > 3.0 {
		surge = 3.0
	}
	if surge < 1.0 {
		surge = 1.0
	}
	return surge
}
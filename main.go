package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

type RouteResponse struct {
	Status    string `json:"status"`
	Original  string `json:"original"`
	Suggested string `json:"suggested"`
}

type FXResponse struct {
	Pair string  `json:"pair"`
	Rate float64 `json:"rate"`
}

type DispatchRequest struct {
	UserID   string  `json:"userId"`
	RegionID string  `json:"regionId"`
	Amount   float64 `json:"amount"`
}

func checkGovernance(regionId string, amount float64) (bool, string) {
	resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:3001/api/v1/route/%s", regionId))
	if err != nil { return true, "GRID_OFFLINE" }
	defer resp.Body.Close()

	var route RouteResponse
	json.NewDecoder(resp.Body).Decode(&route)

	if route.Status == "REROUTED" {
		src := strings.Replace(route.Original, "AF-", "", 1)
		dst := strings.Replace(route.Suggested, "AF-", "", 1)
		pair := fmt.Sprintf("%s_%s", src, dst)

		fxResp, err := http.Get(fmt.Sprintf("http://127.0.0.1:3001/api/v1/fx-rate/%s", pair))
		var fx FXResponse
		if err == nil {
			defer fxResp.Body.Close()
			json.NewDecoder(fxResp.Body).Decode(&fx)
		}

		finalRate := fx.Rate
		if finalRate <= 0 { finalRate = 0.015 }

		// 🏛️ REVENUE LOGIC: 0.5% FEE
		rawAmount := amount * finalRate
		tax := rawAmount * 0.005
		settledAmount := rawAmount - tax

		return true, fmt.Sprintf("REROUTED_TO_%s_VALUED_AT_%.2f_FEE_%.2f", route.Suggested, settledAmount, tax)
	}
	return false, "HEALTHY"
}

func main() {
	http.HandleFunc("/dispatch", func(w http.ResponseWriter, r *http.Request) {
		var req DispatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad Request", 400)
			return
		}

		isLocked, reason := checkGovernance(req.RegionID, req.Amount)
		if isLocked {
			w.WriteHeader(423)
			json.NewEncoder(w).Encode(map[string]string{
				"status": "error",
				"message": fmt.Sprintf("REGION_LOCKED: %s", reason),
			})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	})

	fmt.Println("🚀 L1 ENFORCER ONLINE | REVENUE MODE | PORT 3010")
	log.Fatal(http.ListenAndServe(":3010", nil))
}

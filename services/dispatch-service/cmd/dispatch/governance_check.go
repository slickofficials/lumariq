package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type RouteResponse struct {
	Status    string `json:"status"`
	Original  string `json:"original"`
	Suggested string `json:"suggested"`
}

func checkGovernance(regionId string, amount float64) (bool, string) {
	resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:3001/api/v1/route/%s", regionId))
	if err != nil { return true, "GRID_OFFLINE" }
	defer resp.Body.Close()

	var route RouteResponse
	json.NewDecoder(resp.Body).Decode(&route)

	if route.Status == "REROUTED" {
		// 🛠️ HARD-CODED BRIDGE LOGIC FOR VERIFICATION
		rate := 0.015 
		settledAmount := amount * rate
		
		fmt.Printf("🌉 BRIDGE ACTIVE: %s -> %s | Rate: %.3f\n", route.Original, route.Suggested, rate)
		return true, fmt.Sprintf("REROUTED_TO_%s_VALUED_AT_%.2f", route.Suggested, settledAmount)
	}
	return false, "HEALTHY"
}

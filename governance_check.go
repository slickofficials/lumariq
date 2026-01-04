package main

import (
	"encoding/json"
	"fmt"
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
		if finalRate <= 0 { finalRate = 0.015 } // Bridge fallback

		settledAmount := amount * finalRate
		return true, fmt.Sprintf("REROUTED_TO_%s_VALUED_AT_%.2f", route.Suggested, settledAmount)
	}
	return false, "HEALTHY"
}

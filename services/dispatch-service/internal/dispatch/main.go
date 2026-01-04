package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"lumariq/services/dispatch-service/internal/pricing"
)

type DispatchRequest struct {
	HexId string `json:"hexId"`
}

func handleDispatch(w http.ResponseWriter, r *http.Request) {
	var req DispatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return
	}

	regionId := ""
	if len(req.HexId) >= 6 { regionId = req.HexId[:6] }

	fmt.Printf("🛡️ [L1] Governance Check: %s\n", regionId)

	if !pricing.IsRegionOpen(regionId) {
		fmt.Printf("🚫 [L1] REJECTED: %s is LOCKED\n", regionId)
		w.WriteHeader(http.StatusLocked)
		json.NewEncoder(w).Encode(map[string]string{"error": "REGION_LOCKED_BY_NEURON_GRID"})
		return
	}

	fmt.Printf("✅ [L1] APPROVED: %s\n", req.HexId)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func main() {
	http.HandleFunc("/dispatch", handleDispatch)
	fmt.Println("🛰️ L1 ENFORCER LIVE ON PORT 3002")
	log.Fatal(http.ListenAndServe(":3002", nil))
}

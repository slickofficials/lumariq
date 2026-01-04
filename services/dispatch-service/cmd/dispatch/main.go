package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type DispatchRequest struct {
	UserID   string  `json:"userId"`
	RegionID string  `json:"regionId"`
	Amount   float64 `json:"amount"`
}

func main() {
	http.HandleFunc("/dispatch", func(w http.ResponseWriter, r *http.Request) {
		var req DispatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// 🛡️ Passing BOTH regionId and amount to the logic in governance_check.go
		isLocked, reason := checkGovernance(req.RegionID, req.Amount)
		
		if isLocked {
			w.WriteHeader(http.StatusLocked)
			json.NewEncoder(w).Encode(map[string]string{
				"status": "error",
				"message": fmt.Sprintf("REGION_LOCKED: %s", reason),
			})
			return
		}

		fmt.Printf("✅ [L1] Approved: %s for %.2f in %s\n", req.UserID, req.Amount, req.RegionID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	})

	fmt.Println("🚀 L1 ENFORCER ONLINE | SETTLEMENT ENABLED")
	log.Fatal(http.ListenAndServe(":3002", nil))
}

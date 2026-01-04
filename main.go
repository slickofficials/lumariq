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

	fmt.Println("🚀 L1 ENFORCER ONLINE | PORT 3004")
	log.Fatal(http.ListenAndServe(":3004", nil))
}

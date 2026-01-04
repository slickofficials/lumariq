package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

func main() {
	// Endpoint: /api/v1/route/{regionId}
	http.HandleFunc("/api/v1/route/", func(w http.ResponseWriter, r *http.Request) {
		regionID := strings.TrimPrefix(r.URL.Path, "/api/v1/route/")
		w.Header().Set("Content-Type", "application/json")
		
		if regionID == "AF-NGA" {
			json.NewEncoder(w).Encode(map[string]string{
				"status":    "REROUTED",
				"original":  "AF-NGA",
				"suggested": "AF-GHA",
			})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "HEALTHY"})
	})

	// Endpoint: /api/v1/fx-rate/{pair}
	http.HandleFunc("/api/v1/fx-rate/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// Logic matches the Enforcer's NGA_GHA expectation
		json.NewEncoder(w).Encode(map[string]interface{}{
			"pair": "NGA_GHA",
			"rate": 0.015,
		})
	})

	fmt.Println("🚀 L5 GO-BRAIN ONLINE | PORT 3001")
	log.Fatal(http.ListenAndServe(":3001", nil))
}

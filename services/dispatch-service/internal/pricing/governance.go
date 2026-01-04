package pricing

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type GridStatus struct {
	RegionId string `json:"region_id"`
	Locked   bool   `json:"locked"`
}

// IsRegionOpen checks if the specific sector is currently tradeable
func IsRegionOpen(regionId string) bool {
	url := os.Getenv("NEURON_GRID_STATUS_URL")
	if url == "" {
		url = "http://localhost:3001/admin/grid-status"
	}

	client := http.Client{Timeout: 1 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("⚠️ [L1] Governance Check Failed: %v\n", err)
		return false // Default to locked if we can't verify safety
	}
	defer resp.Body.Close()

	var statuses []GridStatus
	if err := json.NewDecoder(resp.Body).Decode(&statuses); err != nil {
		return false
	}

	for _, s := range statuses {
		if s.RegionId == regionId {
			return !s.Locked
		}
	}

	return true // Region not found in grid, assume open
}

package dispatch

import (
	"errors"
	"fmt"
	"lumariq/services/dispatch-service/internal/pricing"
)

func ValidateDispatchCheck(hexId string) error {
	regionId := ""
	if len(hexId) >= 6 {
		regionId = hexId[:6]
	}

	if regionId == "" {
		return nil
	}

	fmt.Printf("🛡️ [L1] Pre-Flight Check: Validating Region %s\n", regionId)

	if !pricing.IsRegionOpen(regionId) {
		return errors.New("NEURON_GRID_LOCK: Region " + regionId + " is currently in shock-absorption mode")
	}

	return nil
}

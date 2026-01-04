package pricing

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type SurgeSignal struct {
	HexId      string  `json:"hexId"`
	Multiplier float64 `json:"multiplier"`
}

func ReportToNeuronGrid(hexId string, multiplier float64) {
	if multiplier < 2.5 {
		return
	}

	url := os.Getenv("NEURON_GRID_URL")
	secret := os.Getenv("INTERNAL_SHARED_SECRET")
	
	go func() {
		payload, _ := json.Marshal(SurgeSignal{HexId: hexId, Multiplier: multiplier})

		// Create HMAC Signature
		h := hmac.New(sha256.New, []byte(secret))
		h.Write(payload)
		signature := hex.EncodeToString(h.Sum(nil))

		client := http.Client{Timeout: 2 * time.Second}
		req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-lumariq-signature", signature)

		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("⚠️ [L1] Connection Error: %v\n", err)
			return
		}
		defer resp.Body.Close()
		fmt.Printf("📡 [L1] SIGNED SIGNAL SENT: %s @ %.2fx\n", hexId, multiplier)
	}()
}

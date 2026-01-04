#!/usr/bin/env bash

echo "== Lumariq E2E: ride.completed -> wallet.referrals -> referral reward -> wallet credit =="

DISPATCH_URL="${DISPATCH_URL:-http://localhost:8080}"      # change if needed
LEDGER_URL="${LEDGER_URL:-http://localhost:7070}"          # wallet-ledger
RIDE_ID="ride-$(date +%s)"
DRIVER_ID="driver-123"
PASSENGER_ID="user-456"

echo ""
echo "[1] health checks"
curl -s "$LEDGER_URL/health" && echo ""
echo ""

echo "[2] publish ride.completed (dispatch -> rabbit -> wallet.referrals)"
curl -s -X POST "$DISPATCH_URL/api/dispatch/complete-ride" \
  -H "Content-Type: application/json" \
  -d "{\"rideId\":\"$RIDE_ID\",\"driverId\":\"$DRIVER_ID\",\"passengerId\":\"$PASSENGER_ID\",\"amountMinor\":25000,\"currency\":\"NGN\"}" \
  && echo ""
echo ""

echo "[3] wait a moment for consumers"
sleep 2

echo "[4] check idempotency example (will be false until mapping exists OR eligible event emitted)"
# This key format matches referralIdemKey() once referrer/referee mapping is available:
IDEM_KEY="referral:ride.completed:$RIDE_ID:999:888"
curl -s "$LEDGER_URL/idempotency/$(python -c "import urllib.parse; print(urllib.parse.quote('''$IDEM_KEY'''))")" && echo ""
echo ""

echo "DONE ✅"
echo ""
echo "Notes:"
echo "- If you haven't wired resolveUsers() to users-service (referral mapping), rewards may SKIP (by design)."
echo "- Once mapping exists, idempotency endpoint will flip to exists=true after first credit."

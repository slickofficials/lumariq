#!/bin/bash

BASE="http://localhost:4015/dispatch/api"

echo "👉 Health Check"
curl -s http://localhost:4015/healthz | jq
echo

echo "👉 Register Driver Storm"
curl -s -X POST $BASE/driver/register \
-H "Content-Type: application/json" \
-d '{"id":"driver-010","name":"Storm","vehicleType":"Car","vehiclePlate":"ABJ-010","lat":6.45,"lng":3.45}' | jq
echo

echo "👉 Toggle Availability"
curl -s -X PATCH $BASE/driver/available \
-H "Content-Type: application/json" \
-d '{"driverId":"driver-010","available":true}' | jq
echo

echo "👉 Get Driver Profile"
curl -s $BASE/driver/profile/driver-010 | jq
echo

echo "👉 Get Driver Location"
curl -s $BASE/driver/location/driver-010 | jq
echo

echo "👉 Seed Queued Ride (manual insert)"
docker compose exec -T postgres psql -U lumariq -d dispatch <<'SQL'
INSERT INTO rides (
    id, passenger_id, driver_id,
    pickup_lat, pickup_lng,
    dropoff_lat, dropoff_lng,
    distance_km, fare, currency,
    status, requested_at, updated_at, rated
) VALUES (
    'ride-queued-001', 'pass-999', NULL,
    6.52, 3.37,
    6.50, 3.42,
    10.0, 2000, 'NGN',
    'queued', NOW(), NOW(), FALSE
)
ON CONFLICT (id) DO NOTHING;
SQL
echo

echo "👉 Smart-Bid on queued ride"
smartResp=$(curl -s -X POST $BASE/ride/smart-bid \
-H "Content-Type: application/json" \
-d '{"rideId":"ride-queued-001","driverId":"driver-010","passengerId":"pass-999","bidAmount":1800}')
echo "$smartResp" | jq
echo

echo "👉 Complete Ride"
curl -s -X POST $BASE/ride/complete \
-H "Content-Type: application/json" \
-d '{"rideId":"ride-queued-001","driverId":"driver-010"}' | jq
echo

echo "👉 Rate Driver"
curl -s -X POST $BASE/ride/rate \
-H "Content-Type: application/json" \
-d '{"rideId":"ride-queued-001","driverId":"driver-010","rating":5}' | jq
echo

echo "🚀 FULL DISPATCH FLOW SUCCESS"

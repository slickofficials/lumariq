#!/bin/bash
# 🚀 LUMARIQ EMPIRE SURGE SIMULATOR
# Simulating 40,000+ Active Nodes

echo "INTENSITY: HIGH | TARGET: EMPIRE_ENGINE_L7"

for i in {1..50}
do
   # Fire concurrent requests to simulate high TPS
   curl -s -X POST http://localhost:3001/api/v1/admin/inject \
   -H "Content-Type: application/json" \
   -d "{\"user\": \"node_$i\", \"region\": \"AF-NGA\", \"amount\": $((RANDOM % 1000 + 100))}" &
done

wait
echo "SURGE_BATCH_COMPLETE: 50 EVENTS INJECTED"

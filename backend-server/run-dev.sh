#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Force Temurin in this shell
JHOME_UNIX="/c/Users/slick/.jdks/jdk-17.0.17+10"
JHOME_WIN="$(cygpath -w "$JHOME_UNIX")"
export JAVA_HOME="$JHOME_WIN"
export PATH="$JHOME_UNIX/bin:$PATH"

./gradlew --stop >/dev/null 2>&1 || true
./gradlew clean test -q

set -a; [ -f .env.local ] && source .env.local; set +a

LOG="run.$(date +%Y%m%d_%H%M%S).log"
( ./gradlew run >"$LOG" 2>&1 ) & PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT

for i in $(seq 1 60); do
  curl -fsS http://127.0.0.1:8080/health >/dev/null 2>&1 && break
  sleep 1
done

echo "HEALTH=$(curl -fsS http://127.0.0.1:8080/health || true)"
echo "READY=$(curl -fsS http://127.0.0.1:8080/ready  || true)"

echo "==> logs: $LOG"
tail -n 80 "$LOG" || true

echo "✅ dev run ready"
wait $PID

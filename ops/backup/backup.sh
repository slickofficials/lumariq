#!/usr/bin/env bash
set -u

: "${COUNTRY:=NG}"
: "${DATABASE_URL:?missing DATABASE_URL}"
: "${BACKUP_BUCKET:?missing BACKUP_BUCKET}"
: "${S3_ENDPOINT:=}"
: "${AWS_ACCESS_KEY_ID:?missing AWS_ACCESS_KEY_ID}"
: "${AWS_SECRET_ACCESS_KEY:?missing AWS_SECRET_ACCESS_KEY}"
: "${AWS_DEFAULT_REGION:=eu-west-1}"

TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="lumariq_${COUNTRY}_${TS}.sql.gz"

echo "📦 Backup start: ${OUT}"
pg_dump "${DATABASE_URL}" | gzip > "${OUT}"

echo "☁️ Upload to object store bucket=${BACKUP_BUCKET}"
if [ -n "${S3_ENDPOINT}" ]; then
  aws --endpoint-url "${S3_ENDPOINT}" s3 cp "${OUT}" "s3://${BACKUP_BUCKET}/${COUNTRY}/${OUT}"
else
  aws s3 cp "${OUT}" "s3://${BACKUP_BUCKET}/${COUNTRY}/${OUT}"
fi

echo "✅ Backup done"

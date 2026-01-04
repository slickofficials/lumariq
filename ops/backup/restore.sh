#!/usr/bin/env bash
set -u

: "${COUNTRY:=NG}"
: "${DATABASE_URL:?missing DATABASE_URL}"
: "${BACKUP_BUCKET:?missing BACKUP_BUCKET}"
: "${BACKUP_KEY:?missing BACKUP_KEY}"  # e.g. NG/lumariq_NG_20251224T000000Z.sql.gz
: "${S3_ENDPOINT:=}"
: "${AWS_ACCESS_KEY_ID:?missing AWS_ACCESS_KEY_ID}"
: "${AWS_SECRET_ACCESS_KEY:?missing AWS_SECRET_ACCESS_KEY}"
: "${AWS_DEFAULT_REGION:=eu-west-1}"

TMP="restore.sql.gz"

echo "⬇️ Download backup ${BACKUP_KEY}"
if [ -n "${S3_ENDPOINT}" ]; then
  aws --endpoint-url "${S3_ENDPOINT}" s3 cp "s3://${BACKUP_BUCKET}/${BACKUP_KEY}" "${TMP}"
else
  aws s3 cp "s3://${BACKUP_BUCKET}/${BACKUP_KEY}" "${TMP}"
fi

echo "♻️ Restoring into DATABASE_URL (DANGEROUS: overwrites data)"
gunzip -c "${TMP}" | psql "${DATABASE_URL}"
echo "✅ Restore complete"

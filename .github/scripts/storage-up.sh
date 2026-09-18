#!/usr/bin/env bash
set -euo pipefail

MINIO_IMAGE="quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z"
MC_IMAGE="quay.io/minio/mc:RELEASE.2025-08-13T08-35-41Z"
BUCKET="${STORAGE_BUCKET:-standard}"
ACCESS_KEY="${STORAGE_ACCESS_KEY_ID:-app}"
SECRET_KEY="${STORAGE_SECRET_ACCESS_KEY:-appsecret}"

docker run -d --name minio \
  -p 9100:9000 \
  -e "MINIO_ROOT_USER=${ACCESS_KEY}" \
  -e "MINIO_ROOT_PASSWORD=${SECRET_KEY}" \
  "${MINIO_IMAGE}" server /data

docker run --rm --network host --entrypoint sh "${MC_IMAGE}" -c "
  until mc alias set local http://localhost:9100 ${ACCESS_KEY} ${SECRET_KEY}; do sleep 1; done
  mc mb --ignore-existing local/${BUCKET}
"

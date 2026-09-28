#!/usr/bin/env bash
set -euo pipefail

OBJECTS_IMAGE="rustfs/rustfs:1.0.0"
BUCKET="${STORAGE_BUCKET:-standard}"
ACCESS_KEY="${STORAGE_ACCESS_KEY_ID:-app}"
SECRET_KEY="${STORAGE_SECRET_ACCESS_KEY:-appsecret}"
ENDPOINT="http://localhost:9100"
SIGV4="aws:amz:us-east-1:s3"
ATTEMPTS=60

docker run -d --name objects \
  -p 9100:9000 \
  -e "RUSTFS_ACCESS_KEY=${ACCESS_KEY}" \
  -e "RUSTFS_SECRET_KEY=${SECRET_KEY}" \
  -e "RUSTFS_VOLUMES=/data" \
  "${OBJECTS_IMAGE}"

bucket_status() {
  curl -s -o /dev/null -w "%{http_code}" --aws-sigv4 "${SIGV4}" \
    --user "${ACCESS_KEY}:${SECRET_KEY}" "$@" "${ENDPOINT}/${BUCKET}" || true
}

for _ in $(seq "${ATTEMPTS}"); do
  if [ "$(bucket_status -X PUT)" = "200" ] || [ "$(bucket_status)" = "200" ]; then
    echo "bucket ${BUCKET} is ready"
    exit 0
  fi
  sleep 1
done

echo "::error::object storage did not become ready"
docker logs objects
exit 1

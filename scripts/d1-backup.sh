#!/bin/sh
set -eu

database="${1:-sasiad-plus-db}"
timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
output="backups/${database}-${timestamp}.sql"

mkdir -p backups

echo "Current Time Travel bookmark:"
wrangler d1 time-travel info "$database"

echo "Exporting ${database} to ${output}..."
wrangler d1 export "$database" --remote --output "$output"

echo "SHA-256:"
env LC_ALL=C LANG=C shasum -a 256 "$output"

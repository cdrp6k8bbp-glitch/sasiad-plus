#!/bin/sh
set -eu

state_dir="$(mktemp -d "${TMPDIR:-/tmp}/sasiad-plus-d1-smoke.XXXXXX")"
trap 'rm -rf "$state_dir"' EXIT INT TERM

echo "Applying every migration to a fresh local D1 database..."
CI=1 wrangler d1 migrations apply sasiad-plus-db-staging \
  --local \
  --env staging \
  --persist-to "$state_dir"

echo "Checking that no migrations remain pending..."
pending="$(wrangler d1 migrations list sasiad-plus-db-staging \
  --local \
  --env staging \
  --persist-to "$state_dir")"
printf '%s\n' "$pending"
printf '%s\n' "$pending" | grep -q "No migrations to apply"

echo "Checking the final schema..."
schema_json="$(wrangler d1 execute sasiad-plus-db-staging \
  --local \
  --env staging \
  --persist-to "$state_dir" \
  --json \
  --command "SELECT CASE WHEN
    EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'listings')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'user')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'messages')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'reservations')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'reviews')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'notifications')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'listing_reports')
    AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'rateLimit')
    AND EXISTS (SELECT 1 FROM pragma_table_info('listings') WHERE name = 'archived_at')
    AND EXISTS (SELECT 1 FROM pragma_table_info('messages') WHERE name = 'read_at')
    AND EXISTS (SELECT 1 FROM pragma_table_info('reservations') WHERE name = 'completed_at')
    THEN 1 ELSE 0 END AS schema_ok;")"

SCHEMA_JSON="$schema_json" node -e '
  const output = JSON.parse(process.env.SCHEMA_JSON);
  if (output?.[0]?.results?.[0]?.schema_ok !== 1) {
    console.error("Fresh D1 schema is incomplete.");
    process.exit(1);
  }
'

echo "Fresh D1 migration check passed."

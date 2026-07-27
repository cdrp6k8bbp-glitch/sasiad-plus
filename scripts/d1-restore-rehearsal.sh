#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: sh scripts/d1-restore-rehearsal.sh BACKUP.sql[.enc]" >&2
  exit 1
fi

backup="$1"

if [ ! -f "$backup" ]; then
  echo "Backup file not found: $backup" >&2
  exit 1
fi

workdir="$(mktemp -d)"
sql_file="$workdir/backup.sql"
database_file="$workdir/rehearsal.sqlite"

cleanup() {
  rm -rf "$workdir"
}
trap cleanup EXIT INT TERM

case "$backup" in
  *.enc)
    if [ -z "${BACKUP_ENCRYPTION_PASSWORD:-}" ]; then
      echo "Set BACKUP_ENCRYPTION_PASSWORD before testing an encrypted backup." >&2
      exit 1
    fi
    openssl enc -d -aes-256-cbc -pbkdf2 -iter 210000 \
      -in "$backup" \
      -out "$sql_file" \
      -pass env:BACKUP_ENCRYPTION_PASSWORD
    ;;
  *)
    cp "$backup" "$sql_file"
    ;;
esac

sqlite3 "$database_file" < "$sql_file"

integrity="$(sqlite3 "$database_file" "PRAGMA integrity_check;")"
if [ "$integrity" != "ok" ]; then
  echo "Restore rehearsal failed integrity check: $integrity" >&2
  exit 1
fi

tables="$(sqlite3 "$database_file" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")"
users="$(sqlite3 "$database_file" "SELECT COUNT(*) FROM \"user\";" 2>/dev/null || echo 0)"
listings="$(sqlite3 "$database_file" "SELECT COUNT(*) FROM listings;" 2>/dev/null || echo 0)"

echo "Restore rehearsal passed."
echo "Tables: $tables"
echo "Users: $users"
echo "Listings: $listings"

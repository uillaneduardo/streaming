#!/bin/sh
# Migration-only runner: do not use this service for sample data.
set -eu

: "${DB_USER:?DB_USER is required}"
: "${DB_NAME:?DB_NAME is required}"
: "${MYSQL_PWD:?MYSQL_PWD is required}"

sql() {
  mariadb -h db -u "$DB_USER" --batch --skip-column-names "$DB_NAME" "$@"
}

# The previous deploy repeatedly executed the initial SQL file, reintroducing
# example productions after users deleted them. Identify existing installations
# BEFORE creating the tracking table so we can safely baseline their DDL.
tracking_exists="$(sql -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='schema_migrations'")"
legacy_tables="$(sql -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name IN ('teams','series','series_teams','seasons','episodes','banners','home_sections')")"

sql <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  name VARCHAR(128) PRIMARY KEY,
  checksum CHAR(64) NOT NULL,
  legacy_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SQL

# Migration tracking did not exist in releases before this fix.
# Only baseline 001 when all original catalogue tables already exist.
# Migrations 002+ are idempotent and will be verified/applied once afterward.
if [ "$tracking_exists" = "0" ] && [ "$legacy_tables" = "7" ]; then
  base="/migrations/001_initial.sql"
  [ -r "$base" ] || { echo "Missing initial migration" >&2; exit 1; }
  digest="$(sha256sum "$base" | cut -d ' ' -f 1)"
  sql -e "INSERT INTO schema_migrations(name,checksum,legacy_baseline) VALUES ('001_initial.sql','$digest',TRUE)"
  echo "Legacy catalogue detected: baseline 001 recorded without replaying its fixtures."
fi

found=0
for file in /migrations/[0-9][0-9][0-9]_*.sql; do
  [ -f "$file" ] || continue
  found=1
  name="${file##*/}"
  # Filenames are used only after a strict whitelist check; never interpolate
  # paths from user input into the SQL queries.
  case "$name" in
    *[!a-zA-Z0-9_.-]*)
      echo "Invalid migration filename: $name" >&2
      exit 1
      ;;
  esac

  digest="$(sha256sum "$file" | cut -d ' ' -f 1)"
  recorded="$(sql -e "SELECT checksum FROM schema_migrations WHERE name='$name'" | tr -d '\r\n')"
  if [ -n "$recorded" ]; then
    if [ "$recorded" != "$digest" ]; then
      echo "ERROR: Applied migration $name was modified. Never edit recorded migrations." >&2
      exit 1
    fi
    echo "Already applied: $name"
    continue
  fi

  echo "Applying migration: $name"
  sql < "$file"
  sql -e "INSERT INTO schema_migrations(name,checksum) VALUES ('$name','$digest')"
  echo "Applied: $name"
done

[ "$found" = "1" ] || { echo "No schema migrations found" >&2; exit 1; }
echo "Migrations complete. No sample catalogue is inserted on deploy."

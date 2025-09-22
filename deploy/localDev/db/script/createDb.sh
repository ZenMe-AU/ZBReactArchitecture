#!/bin/bash
set -e
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../docker/config.env"

MODULE_DIR="$SCRIPT_DIR/../../../../module"
echo "Bootstrapping module databases from $MODULE_DIR..."

for dir in "$MODULE_DIR"/*; do
  if [ -d "$dir" ]; then
    dbName=$(basename "$dir")
    printf "Database: %-20s " "$dbName"

    if docker exec dev-postgres psql -U "$POSTGRES_ADMIN_USER" -d "$POSTGRES_DB" -tc \
         "SELECT 1 FROM pg_database WHERE datname = '$dbName'" \
         | grep -q 1; then
      printf "${YELLOW}%s${RESET}\n" "Exists"
    else
      docker exec dev-postgres psql -U "$POSTGRES_ADMIN_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE \"$dbName\"" > /dev/null 2>&1
      printf "${GREEN}%s${RESET}\n" "Created"
    fi
  fi
done
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../docker/config.env"

# check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

echo "Starting PostgreSQL & pgAdmin..."
docker compose --env-file "$SCRIPT_DIR/../docker/config.env" -f "$SCRIPT_DIR/../docker/docker-compose.yml" up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec dev-postgres pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Check if POSTGRES_ADMIN_USER exists
echo "Checking if PostgreSQL role '$POSTGRES_ADMIN_USER' exists..."
if ! docker exec dev-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$POSTGRES_ADMIN_USER'" | grep -q 1; then
  echo "Role '$POSTGRES_ADMIN_USER' does not exist. Creating it..."
  docker exec dev-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE ROLE $POSTGRES_ADMIN_USER WITH LOGIN SUPERUSER PASSWORD '$POSTGRES_ADMIN_PASSWORD';"
  echo "Role '$POSTGRES_ADMIN_USER' created."
else
  echo "Role '$POSTGRES_ADMIN_USER' already exists."
fi

sleep 3

bash "$SCRIPT_DIR/createDb.sh"
# bash "$SCRIPT_DIR/generateServer.sh"

# echo "Restarting pgAdmin to reload servers..."
# docker restart dev-pgadmin

echo "Environment is ready!"
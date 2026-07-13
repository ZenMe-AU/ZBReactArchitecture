#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Stopping and removing containers and volumes..."
docker compose --env-file "$SCRIPT_DIR/../docker/config.env" -f "$SCRIPT_DIR/../docker/docker-compose.yml" down -v
echo "Stopped and cleaned up."

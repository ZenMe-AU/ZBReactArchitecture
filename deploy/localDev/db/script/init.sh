#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../docker/config.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating default config.env..."
  cat > "$ENV_FILE" <<EOF
# PostgreSQL
POSTGRES_DB=postgres
POSTGRES_USER=root
POSTGRES_PASSWORD=DatabasePassword123!
POSTGRES_PORT=55432

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@localhost.com
PGADMIN_DEFAULT_PASSWORD=DefaultPassword123!
PGADMIN_PORT=5050
POSTGRES_ADMIN_USER=admin
POSTGRES_ADMIN_PASSWORD=AdminPassword123!

# Quest 3 local application user
QUEST3TIER_DB=quest3Tier
QUEST3TIER_USER=vscode
QUEST3TIER_PASSWORD=vscode
EOF
  echo "config.env created with default values."
  echo "Please update the config.env file with your specific settings."
else
  echo "config.env already exists."
fi

bash "$SCRIPT_DIR/generateServer.sh"

#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../docker/config.env"

OUTPUT="$SCRIPT_DIR/../docker/pgadmin/servers.json"
MODULE_DIR="$SCRIPT_DIR/../../module"

# Ensure pgadmin directory exists
mkdir -p "$SCRIPT_DIR/../docker/pgadmin"

# If servers.json doesn't exist, create an empty one
if [ ! -f "$OUTPUT" ]; then
  echo "{}" > "$OUTPUT"
fi

# Generate a single pgAdmin server config that connects to the main PostgreSQL instance
cat > "$OUTPUT" <<EOF
{
  "Servers": {
    "1": {
      "Name": "Local",
      "Group": "Servers",
      "Host": "postgres",
      "Port": $POSTGRES_PORT,
      "MaintenanceDB": "$POSTGRES_DB",
      "Username": "$POSTGRES_ADMIN_USER",
      "UseSSHTunnel": 0,
      "TunnelPort": "22",
      "TunnelAuthentication": 0,
      "KerberosAuthentication": false,
      "ConnectionParameters": {
          "sslmode": "prefer",
          "connect_timeout": 10
      },
      "Tags": []
    }
  }
}
EOF

echo "pgAdmin/servers.json generated with a single connection to list all module databases."
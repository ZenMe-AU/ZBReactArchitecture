#!/bin/bash

set +x

PSQL_QUERY_PREFIX="-u postgres psql -c"

echo "Starting local PostgreSQL server..."
sudo systemctl start postgresql

# Checks if PostgreSQL server is running using systemctl
echo "Checking PostgreSQL server status..."
sudo systemctl status postgresql --no-pager
OUTPUT=$(sudo systemctl is-active postgresql)
if [ "$OUTPUT" = "active" ]; then
    echo "PostgreSQL server started successfully."
else
    echo "Failed to start PostgreSQL server."
    exit 1
fi

# Checks if PostgreSQL is only listening on localhost
echo "Checking if the PostgreSQL server is listening on the expected addresses..."
OUTPUT=$(sudo $PSQL_QUERY_PREFIX "SHOW listen_addresses;" 2>/dev/null)

if echo "$OUTPUT" | grep -qE '^\s*localhost\s*$' && echo "$OUTPUT" | grep -qE '^\s*\(1 row\)\s*$'; then
    echo "PostgreSQL server is listening on the expected addresses."
else
    echo "PostgreSQL server is not listening on the expected addresses."
    echo "Output was:"
    echo "$OUTPUT"
    exit 1
fi

# Currently does not edit pg_hba.conf or postgresql.conf to ensure that only connections from localhost is allowed
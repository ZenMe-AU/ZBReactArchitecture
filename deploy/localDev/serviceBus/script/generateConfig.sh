#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_DIR="$SCRIPT_DIR/../../../../module"
OUTPUT="$SCRIPT_DIR/config.json"
NAMESPACE="localServiceBusEmulator"

printf "START: Generating $OUTPUT"

cat > "$OUTPUT" <<EOF
{
  "UserConfig": {
    "Namespaces": [
      {
        "Name": "$NAMESPACE",
        "Queues": [],
        "Topics": []
      }
    ]
  }
}
EOF

process_entity() {
  local entity_type=$1 # "Queues" or "Topics"
  local file=$2

  local json_key_lower=$(echo "$entity_type" | tr '[:upper:]' '[:lower:]')
  local json_key_upper=$(echo "$entity_type" | tr '[:lower:]' '[:upper:]')
  local entities=$(jq ".${json_key_lower} // .${entity_type} // .${json_key_upper} // empty" "$file")

  if [[ "$entities" != "" && "$entities" != "null" ]]; then
    printf "Appending $entity_type from $file\n"
    tmp=$(mktemp)
    jq --argjson newEntities "$entities" \
      ".UserConfig.Namespaces[0].${entity_type} += \$newEntities" "$OUTPUT" > "$tmp" && mv "$tmp" "$OUTPUT"
  fi
}

for module_dir in "$MODULE_DIR"/*/func/deploy/localDev/serviceBus; do
  if [[ -d "$module_dir" ]]; then
    for file in "$module_dir"/*.json; do
      [[ -f "$file" ]] || continue

      process_entity "Queues" "$file"
      process_entity "Topics" "$file"
    done
  fi
done

deduplicate_entities() {
  local entity_type=$1
  duplicates=$(jq -r "
    .UserConfig.Namespaces[0].${entity_type}
    | group_by(.Name)
    | map(select(length > 1) | .[1:][] .Name)
    | .[]
  " "$OUTPUT")

  if [[ -n "$duplicates" ]]; then
    while IFS= read -r name; do
      printf "\e[33m WARNING: Removed duplicate %s '%s'\e[0m\n" "$entity_type" "$name"
    done <<< "$duplicates"
  fi

  tmp=$(mktemp)
  jq ".UserConfig.Namespaces[0].${entity_type} |= unique_by(.Name)" \
    "$OUTPUT" > "$tmp" && mv "$tmp" "$OUTPUT"
}

deduplicate_entities "Queues"
deduplicate_entities "Topics"

printf "SUCCESS: $OUTPUT generated!"
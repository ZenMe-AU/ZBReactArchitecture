#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_DIR="$SCRIPT_DIR/../../module"

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo "Searching modules in $MODULE_DIR..."

migrated=()
skipped=()
failed=()

for dir in "$MODULE_DIR"/*; do
  if [ -d "$dir" ]; then
    module_name=$(basename "$dir")
    pkg="$dir/func/package.json"

    if [ ! -f "$pkg" ]; then
      skipped+=("Skipping $(printf '%-20s' "$module_name") — no package.json")
      continue
    fi

    if ! grep -q '"migrate:up"' "$pkg"; then
      skipped+=("Skipping $(printf '%-20s' "$module_name") — no 'migrate:up' script")
      continue
    fi

    echo "Running migrate:up in $module_name..."
    (
      cd "$dir/func"
      if [ -f "bun.lockb" ]; then
        bun run migrate:up \
          && migrated+=("Done: $(printf '%-20s' "$module_name") (bun)") \
          || failed+=("Failed: $(printf '%-20s' "$module_name") (bun)")
      elif [ -f "yarn.lock" ]; then
        yarn migrate:up \
          && migrated+=("Done: $(printf '%-20s' "$module_name") (yarn)") \
          || failed+=("Failed: $(printf '%-20s' "$module_name") (yarn)")
      else
        npm run migrate:up \
          && migrated+=("Done: $(printf '%-20s' "$module_name") (npm)") \
          || failed+=("Failed: $(printf '%-20s' "$module_name") (npm)")
      fi
    )
  fi
done

# Summary
echo -e "\nMigration Summary:"
if [ ${#migrated[@]} -gt 0 ]; then
  printf "${GREEN}Success:\n${RESET}"
  for msg in "${migrated[@]}"; do
    printf "  ${GREEN}%s${RESET}\n" "$msg"
  done
fi

if [ ${#failed[@]} -gt 0 ]; then
  printf "${RED}Failed:\n${RESET}"
  for msg in "${failed[@]}"; do
    printf "  ${RED}%s${RESET}\n" "$msg"
  done
fi

if [ ${#skipped[@]} -gt 0 ]; then
  printf "${YELLOW}Skipped:\n${RESET}"
  for msg in "${skipped[@]}"; do
    printf "  ${YELLOW}%s${RESET}\n" "$msg"
  done
fi

echo -e "\n${GREEN}All applicable module migrations finished.${RESET}"
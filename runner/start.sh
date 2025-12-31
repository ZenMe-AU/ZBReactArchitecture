#!/bin/bash
set -e

if [[ -z "$RUNNER_TOKEN" ]]; then
  echo "RUNNER_TOKEN is not set"
  exit 1
fi

Org runner or Repo runner
if [[ -n "$GITHUB_REPO" ]]; then
  RUNNER_URL="https://github.com/${GITHUB_ORG}/${GITHUB_REPO}"
else
  RUNNER_URL="https://github.com/${GITHUB_ORG}"
fi

RUNNER_NAME="${RUNNER_NAME:-aca-runner}-$(hostname)"
echo "Registering runner at: $RUNNER_URL"
./config.sh \
  --url "$RUNNER_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "aca" \
  --unattended \
  --ephemeral

./run.sh
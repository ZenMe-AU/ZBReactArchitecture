#!/bin/bash
set -e

./config.sh \
  --url https://github.com/<org-or-repo> \
  --token "$RUNNER_TOKEN" \
  --unattended \
  --replace

./run.sh
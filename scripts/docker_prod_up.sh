#!/bin/sh
# Prod
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR/.." || exit 1   # fieldnotes 루트로 이동

sudo docker-compose \
  -f infra/compose/docker-compose.base.yml \
  -f infra/compose/docker-compose.prod.yml \
  --env-file infra/env/.env.prod \
  up --build
#!/bin/sh
# Staging
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR/.." || exit 1

sudo docker-compose \
  -f infra/compose/docker-compose.base.yml \
  -f infra/compose/docker-compose.staging.yml \
  --env-file infra/env/.env.staging \
  up -d --build
# Dev
docker-compose \
  -p fieldnotes-dev \
  -f ../infra/compose/docker-compose.base.yml \
  -f ../infra/compose/docker-compose.dev.yml \
  --env-file ../infra/env/.env.dev \
  down
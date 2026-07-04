# Staging
docker-compose \
  -p fieldnotes-staging \
  -f ../infra/compose/docker-compose.base.yml \
  -f ../infra/compose/docker-compose.staging.yml \
  --env-file ../infra/env/.env.staging \
  down
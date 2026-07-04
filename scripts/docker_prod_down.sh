# Prod
docker-compose \
  -p fieldnotes-production \
  -f ../infra/compose/docker-compose.base.yml \
  -f ../infra/compose/docker-compose.prod.yml \
  --env-file ../infra/env/.env.prod \
  down
# Dev
sudo docker compose \
  -f ../infra/compose/docker-compose.base.yml \
  -f ../infra/compose/docker-compose.prod.yml \
  --env-file ../infra/env/.env.prod \
  up --build
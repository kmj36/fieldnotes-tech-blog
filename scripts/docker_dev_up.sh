# Dev
sudo docker-compose \
  -f ../infra/compose/docker-compose.base.yml \
  -f ../infra/compose/docker-compose.dev.yml \
  --env-file ../infra/env/.env.dev \
  up --build
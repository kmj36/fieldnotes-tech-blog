#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 migration_name"
  exit 1
fi

NAME=$1

sudo docker-compose run --rm fieldnotes_migrate \
  create -ext sql -dir /migrations -seq "$NAME"

sudo chown 1000:1000 -R ../migrations
#!/usr/bin/env bash

echo "Environment: production"
echo "Starting project..."

export NODE_ENV="production"

cd /var/www/lobbygow || exit
node \
  --require tsx/cjs \
  --env-file=".env.$NODE_ENV" \
  index.js

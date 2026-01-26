#!/usr/bin/env bun

echo "Environment: production"
echo "Starting project..."

export NODE_ENV="production"

cd /var/www/lobbygow || exit
/home/bgord/.bun/bin/bun install --production --no-save --exact
/home/bgord/.bun/bin/bun index.js

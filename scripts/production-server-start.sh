#!/usr/bin/env bun

echo "Environment: production"
echo "Starting project..."

export NODE_ENV="production"

cd /var/www/lobbygow || exit

bun install
bun index.js

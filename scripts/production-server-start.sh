#!/usr/bin/env bun

echo "Environment: production"
echo "Starting project..."

export NODE_ENV="production"

cd /var/www/lobbygow || exit
/home/bgord/.bun/bin/bun install nodemailer
/home/bgord/.bun/bin/bun index.js

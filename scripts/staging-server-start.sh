#!/usr/bin/env bash

echo "Environment: staging"
echo "Starting project..."

export NODE_ENV="staging"

cd /var/www/lobbygow || exit
node --require tsx/cjs index.js

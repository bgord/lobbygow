#!/usr/bin/env bash

# Preload base bash configuration and functions
source bgord-scripts/base.sh

info "Environment: local"
info "Starting project..."

# ==========================================================

export NODE_ENV="local"

npx tsx watch \
  --clear-screen=false \
  --ignore frontend \
  --ignore node_modules \
  index.ts

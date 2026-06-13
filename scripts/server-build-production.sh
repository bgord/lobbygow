#!/usr/bin/env bash

source bgord-scripts/base.sh
setup_base_config

OUTPUT_DIRECTORY="output"

info "Environment: production"
export NODE_ENV="production"

check_if_directory_exists node_modules
check_if_file_exists scripts/production-server-start.sh

step_start "Build cache clean"
rm -rf $OUTPUT_DIRECTORY
step_end "Build cache clean"

step_start "Build directory create"
mkdir -p $OUTPUT_DIRECTORY
step_end "Build directory create"

step_start "Packages install"
bun install --production --no-save --exact
step_end "Packages install"

step_start "scripts/production-server-start.sh copy"
cp scripts/production-server-start.sh $OUTPUT_DIRECTORY
step_end "scripts/production-server-start.sh copy"

step_start "package.json copy"
cp package.json $OUTPUT_DIRECTORY
step_end "package.json copy"

step_start "Infra directory create"
mkdir -p "$OUTPUT_DIRECTORY/infra"
step_end "Infra directory create"

step_start "App compile"
bun build index.ts --outdir "$OUTPUT_DIRECTORY" --target bun --production --minify --sourcemap --metafile
step_end "App compile"

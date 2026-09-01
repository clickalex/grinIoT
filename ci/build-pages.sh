#!/usr/bin/env bash
# Build the Grinrex IoT SPA for GitHub Pages.
#
# Produces a static bundle in dist/public that can be published as-is.
# Usage:  ci/build-pages.sh [base-path]
# Example: ci/build-pages.sh /grinIoT/
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Base path -----------------------------------------------------------
# On GitHub Pages a project site is served from /<repo>/, so Vite needs a
# matching base. Order of precedence: argument > $VITE_BASE_PATH > /<repo>/.
BASE_PATH="${1:-${VITE_BASE_PATH:-}}"
if [[ -z "$BASE_PATH" ]]; then
  REPO_NAME="${GITHUB_REPOSITORY##*/}"
  BASE_PATH="${REPO_NAME:+/$REPO_NAME/}"
  BASE_PATH="${BASE_PATH:-/}"
fi
# Normalise: ensure leading and trailing slash.
[[ "$BASE_PATH" == /* ]] || BASE_PATH="/$BASE_PATH"
[[ "$BASE_PATH" == */ ]] || BASE_PATH="$BASE_PATH/"
export VITE_BASE_PATH="$BASE_PATH"
echo "==> Building with base path: $VITE_BASE_PATH"

# 2. Build the client only (no Node server needed for Pages) -------------
pnpm exec vite build

OUT_DIR="dist/public"
if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "!! Build output missing: $OUT_DIR/index.html" >&2
  exit 1
fi

# 3. Static-hosting niceties --------------------------------------------
# SPA fallback: GitHub Pages serves 404.html for unknown paths. The repo
# already ships client/public/404.html; if it is absent, fall back to a
# copy of index.html so deep links still boot the app.
if [[ ! -f "$OUT_DIR/404.html" ]]; then
  cp "$OUT_DIR/index.html" "$OUT_DIR/404.html"
fi

# Stop Pages/Jekyll from stripping files that start with an underscore.
touch "$OUT_DIR/.nojekyll"

echo "==> Static site ready in $OUT_DIR"

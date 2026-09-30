#!/usr/bin/env bash
# Runs the PHP API (:8000) and the web app (:3000). Ctrl+C stops both.
set -euo pipefail
cd "$(dirname "$0")/.."

trap 'kill 0' EXIT

(cd apps/api && php -S localhost:8000 -t public) &
(cd apps/web && npm run dev) &
wait

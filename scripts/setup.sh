#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

(cd apps/api && composer install)
(cd apps/web && pnpm install)

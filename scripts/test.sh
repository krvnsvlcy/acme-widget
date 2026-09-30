#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

(cd apps/api && composer test)
(cd apps/web && npm run typecheck)

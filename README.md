# Acme Widget Co – Sales System PoC

Monorepo: a PHP basket API and a React/TypeScript web app.

```
apps/api/   PHP 8.3+ basket logic, PHPUnit tests, tiny JSON API (Composer)
apps/web/   Vite + React + TypeScript UI
```

## Setup

```bash
scripts/setup.sh   # composer install + pnpm install
scripts/dev.sh     # api on :8000, web on :3000 (proxies /api)
scripts/test.sh    # PHPUnit + web typecheck
```

Windows: use the matching `scripts\*.cmd` files.

## How it works / assumptions

_TODO: fill in once implemented._

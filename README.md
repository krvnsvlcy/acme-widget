# Acme Widget Co – Sales System PoC

A proof of concept for the sales system of Acme Widget Co, a company that sells
widgets. Customers pick products and quantities, and the system works out the
basket total: the subtotal, any special offers (for example, buy one red widget
and get the second half price) and the delivery charge, which depends on how
much is spent. Offers and delivery pricing are stored as data rather than code,
so the business can change them without touching the application logic.

## Repository structure

This repository is organized as a monorepo with a PHP basket API and a React/TypeScript web app.

```
apps/api/   PHP 8.3+ basket logic
apps/web/   Vite + React + TypeScript UI
docs/       Project documentation
```

## Getting started

Requires PHP 8.3+, Composer, Node and npm.

```bash
scripts/setup.sh   # composer install + npm install
scripts/dev.sh     # api on :8000, web on :3000 (proxies /api)
scripts/test.sh    # PHPUnit + web typecheck
```

Windows: use the matching `scripts\*.cmd` files.

## Documentation

- [Architecture](docs/architecture.md): components of the system and how they communicate with each other.
- [Design](docs/design.md): entities, API and design decisions.
- [Charge rules](docs/domain/charge-rules.md): how offers and delivery pricing are configured and calculated.
- [Deployment](docs/deployment.md): Docker image and Railway setup.

# Acme Widget Co – Web

The storefront UI for the Acme Widget Co sales system proof of concept. It lists
the widgets, lets you set how many of each go in the basket, and shows the
basket's subtotal, discount, delivery and total as calculated by the PHP API in
[apps/api](../api).

Built with React 19, TypeScript, Vite and Tailwind CSS 4. Linted with Oxlint.

## Getting started

From the repo root, `scripts/setup.sh` installs everything and `scripts/dev.sh`
starts the API and this app together. To work on the web app alone:

```bash
pnpm install
pnpm dev
```

The dev server runs on <http://localhost:3000> and proxies `/api` to the PHP
dev server on `localhost:8000` (see [vite.config.ts](vite.config.ts)), so the
API must be running for the page to load.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Vite dev server with HMR |
| `pnpm build` | Typecheck, then build to `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | Run `tsc` without emitting |
| `pnpm lint` | Run Oxlint |

## Structure

```
src/
  main.tsx                     entry point
  App.tsx                      page layout, loads products and cart, owns state
  api.ts                       typed client for the API (all amounts in cents)
  format.ts                    money formatting helpers
  index.css                    Tailwind setup and design tokens
  components/
    ProductCard.tsx            one widget with its price and quantity control
    QuantityStepper.tsx        increment/decrement control
    BasketPanel.tsx            basket lines and totals
    Ring.tsx                   decorative ring graphic
```

## How it talks to the API

[src/api.ts](src/api.ts) wraps the endpoints the UI uses:

| Function | Request |
|---|---|
| `listProducts()` | `GET /api/products` |
| `getCart()` | `GET /api/cart` |
| `setCartQuantity(code, quantity)` | `PUT /api/cart/items/:code` (0 removes the line) |
| `removeFromCart(code)` | `DELETE /api/cart/items/:code` |

Every cart call returns the full recalculated cart, and `App` replaces its cart
state with it. The UI never computes prices or offers itself, so pricing rules
live only in the API (see [docs/charge-rules.md](../../docs/charge-rules.md)).
Errors from the API are shown in an alert at the top of the page.

## Production

The web app is not deployed on its own. The root [Dockerfile](../../Dockerfile)
builds it and serves it from the same origin as the API. See the root
[README](../../README.md#deployment-railway) for details.

# Acme Widget Co – Web

React 19 + TypeScript storefront UI, built with Vite and Tailwind CSS 4 and
linted with Oxlint. It lists the widgets, lets you set quantities and shows the
basket totals calculated by the PHP API in [apps/api](../api). The UI never
calculates prices itself.

## Getting started

From the repo root, `scripts/dev.sh` starts the API and this app together. To
run the web app alone (the API must be running on `localhost:8000`):

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:3000> and proxies `/api` to the API
(see [vite.config.ts](vite.config.ts)).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run `tsc` without emitting |
| `npm run lint` | Run Oxlint |

See the root [architecture](../../docs/architecture.md) and
[deployment](../../docs/deployment.md) docs for how it fits into the system.

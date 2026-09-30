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

## How it works

`Basket` (`apps/api/src/Domain/Basket.php`) is initialised with a `Catalog`
(products and charge rules), `set($code, $quantity)` sets a product's quantity
(0 removes it), and `computeTotal()` returns the breakdown in cents
(subtotal, discount, delivery, total). The interface required by the brief is
also there as written: `add($code)` adds one unit and `total()` returns the
total in cents. Both are thin wrappers over `set()` and `computeTotal()`.

Pricing is data-driven: each `ChargeRule` names a behaviour and carries its
parameters. Rules run lowest `precedence` first (ties by `id`), and later rules
may override earlier ones, so offers are applied before delivery is calculated.
See [docs/charge-rules.md](docs/charge-rules.md) for details.

| Rule | Data | Seeded as |
|---|---|---|
| `product_discount_by_quantity` | `product_code`, `full_quantity`, `discount_quantity`, `discount_percent` | R01, buy 1 get 1 at 50% off |
| `delivery_price_by_subtotal` | `min_subtotal`, `max_subtotal`, `charge` (one range per rule) | free fallback, <$90 $2.95, <$50 $4.95 |

Storage sits behind the `Database` interface: `SqliteDatabase` (used by the
server, file at `apps/api/var/acme.sqlite`) and `InMemoryDatabase` (tests).
Both start empty. `Seed::run($database)` fills in the catalogue and charge
rules, and is safe to run again: products and rules are both matched by
code. The server runs it on every request.

API (the cart is tied to a PHP session cookie; `productCode` is e.g. R01):

```
GET    /api/products           GET  /api/products/{productCode}
GET    /api/cart               PUT  /api/cart/items/{productCode}   {"quantity": 0-99}
DELETE /api/cart/items/{productCode}
```

## Assumptions

- Money is integer cents everywhere; the UI formats it.
- Delivery is based on the subtotal **after** offers (this is what makes
  R01, R01 = $54.37 rather than $52.85).
- Half price is rounded in the customer's favour: the discount is rounded up to
  the cent, so the second $32.95 widget costs $16.47.
- The offer applies once per complete pair of red widgets (3 reds = 1 discount).
- An empty basket has no delivery charge.
- Unknown product codes and unknown rule names fail loudly rather than being ignored.

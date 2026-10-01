# Design

Entities, interfaces and design decisions in the system.

## Entities

### Product

Represents a product available in the catalogue.

- `id`: storage identifier.
- `code`: stable business identifier, such as `R01`.
- `name`: human-readable product name.
- `price`: unit price in cents.

Product codes are used throughout the application and API as the business-facing identifier for a product.

### ChargeRule

Represents a rule that can modify the final cost of a basket.

- `id`: storage identifier.
- `code`: stable business identifier for the rule.
- `rule`: identifies the calculation behavior.
- `data`: configuration required by that rule.
- `precedence`: determines execution order.
- `label`: optional organizational classification such as `offer` or `policy`.
- `name`: optional human-readable name.
- `startsAt` / `endsAt`: optional activation window.

The currently implemented rule types are:

- `product_discount_by_quantity`
- `delivery_price_by_subtotal`

Rules are applied from lowest to highest `precedence`. Rules with equal precedence are ordered by `id`.

See [charge-rules.md](domain/charge-rules.md) for rule formats and calculation semantics.

### Cart and CartItem

`Cart` represents a shopping cart and its owner.

- `id`: storage identifier.
- `ownerRef`: typed reference identifying the cart owner, such as `ses_<id>` for an anonymous session.

`CartItem` represents one product line within a cart.

- `id`: storage identifier.
- `cartId`: cart the item belongs to.
- `productCode`: product represented by the line.
- `quantity`: number of units in the cart.

A cart contains at most one item for each product.

## API

The API is JSON over HTTP under `/api`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/products` | List the catalogue. |
| `GET` | `/api/products/{productCode}` | Get one product. |
| `GET` | `/api/cart` | Get the current cart with totals. |
| `PUT` | `/api/cart/items/{productCode}` | Set a quantity. Body: `{"quantity": 0-99}`. |
| `DELETE` | `/api/cart/items/{productCode}` | Remove a product from the cart. |

Cart mutations return the updated cart, including recalculated totals.

## Decisions

### Server-owned cart

The cart is stored server-side and associated with the browser through a PHP session cookie.

The client does not need to know the cart id or session id. It simply requests `/api/cart`, and the server resolves the current owner and cart.

The `ownerRef` format also leaves room for other owner types later, such as authenticated users.

### Server-authoritative pricing

The React application does not implement discount or delivery calculations.

It sends cart mutations to the API and renders the totals returned by the server.

This keeps pricing logic in one place and avoids duplicating business rules between the frontend and backend.

### PUT for cart quantities

`PUT /api/cart/items/{productCode}` sets the quantity rather than incrementing it.

This makes the operation idempotent: sending the same request repeatedly produces the same cart state.

A quantity of `0` removes the item.

### Data-driven charge rules

Offers and delivery pricing are represented as persisted `ChargeRule` records.

The application implements the supported rule algorithms, while each rule record provides the configuration used by that algorithm.

This allows pricing rules to be changed, reordered or activated independently of the basket itself without introducing a fully generic rules engine.

### Rule precedence

Charge rules execute from lowest to highest `precedence`.

Rules with equal precedence are ordered by `id` to keep evaluation deterministic.

This allows later rules to observe or override effects produced by earlier rules. For example, product discounts run before delivery rules so delivery can be calculated from the discounted subtotal.

### Integer money

All monetary values are stored as integer cents.

This avoids floating-point precision problems and makes rounding behavior explicit.

### SQLite for the proof of concept

SQLite provides persistent storage without requiring an external database service.

Persistence is hidden behind the `Database` interface, so the rest of the application is not coupled directly to SQLite.

### Separate cart state and pricing calculation

`Cart` and `CartItem` represent persisted shopping state.

`Basket` is responsible for calculating the price of that state.

Keeping those responsibilities separate means pricing can be tested independently of database and session behavior.

### Product codes at the application boundary

The API and cart operations use business-facing product codes such as `R01` rather than database-generated product ids.

This matches the identifiers defined by the catalogue and avoids exposing storage ids through the external API.

# Charge rules

Offers, delivery charges, and future mechanisms that alter the final total of a
basket are stored as `ChargeRule` records in the database. This allows business
rules to evolve independently of application code.

`Basket` reads the active rules and applies them when calculating a total.

All monetary amounts are stored in cents.

## Fields shared by every rule

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Storage identifier. Also used as a deterministic tie-breaker when two rules have the same `precedence`. |
| `code` | string | Unique, stable business key, for example `delivery_under_50`. Upserting a rule with an existing `code` updates that rule instead of creating a new one. |
| `rule` | string | Identifies the calculation behavior. This determines how `data` is interpreted. |
| `data` | object | Rule-specific configuration. The available keys depend on `rule`. |
| `precedence` | int, default `0` | Determines execution order. Rules with lower precedence are applied first. Rules with higher precedence are applied later and may override effects produced by earlier rules. |
| `label` | string, optional | Business-facing classification such as `offer`, `policy`, or `coupon`. Has no effect on calculation. |
| `name` | string, optional | Human-readable name for the rule, for example `Buy one red widget, get the second half price`. Has no effect on calculation. |
| `startsAt` / `endsAt` | date-time string, optional | Restricts when the rule is active. Both boundaries are inclusive. Leave either empty for no limit on that side. |

Rules are sorted by:

1. `precedence`, ascending.
2. `id`, ascending when precedence is equal.

This guarantees deterministic execution while allowing higher-precedence rules
to override state produced by lower-precedence rules.

## How a total is calculated

1. **Subtotal:** sum the price of every unit in the basket.
2. **Active rules:** ignore rules outside their `startsAt` / `endsAt` window.
3. **Order rules:** sort active rules by `precedence` from lowest to highest.
   Rules with the same precedence are ordered by `id` ascending.
4. **Apply each rule in order.**
   - Product discounts are accumulated.
   - Delivery rules set the current delivery charge.
   - A rule may therefore override state established by an earlier,
     lower-precedence rule.
   - Rules that depend on the current basket value use the subtotal minus
     discounts applied **so far**.
5. **Total:** `subtotal - discount + delivery`.

An empty basket always costs `0`. No charge rules are applied and there is no
delivery charge.

An unrecognized `rule` value, or a rule missing required `data`, causes an
error rather than being silently ignored.

## Rule types

### `product_discount_by_quantity`

Applies a percentage discount to a number of product units based on quantity.

After each `full_quantity` units charged at full price, up to the next
`discount_quantity` units receive `discount_percent` off. The pattern repeats
for additional units.

| `data` key | Type | Meaning |
|---|---|---|
| `product_code` | string | Product the rule applies to, for example `R01`. |
| `full_quantity` | int | Number of units charged at full price before the discount starts. Must be 0 or more. |
| `discount_quantity` | int | Maximum number of units discounted after each `full_quantity` units. Must be 1 or more. |
| `discount_percent` | int | Percentage discount applied to the discounted units. |

The pattern repeats every `full_quantity + discount_quantity` units. A group
doesn't need to be complete: once `full_quantity` is reached, each further unit
is discounted, up to `discount_quantity`.

```text
group_size      = full_quantity + discount_quantity
complete_groups = floor(quantity / group_size)
remainder       = quantity % group_size

discounted = complete_groups * discount_quantity
           + clamp(remainder - full_quantity, 0, discount_quantity)
```

For example, "buy 2 at full price, then up to 3 at 50% off":

```json
{
  "full_quantity": 2,
  "discount_quantity": 3,
  "discount_percent": 50
}
```

| Quantity | Full price | Discounted |
|---:|---:|---:|
| 1 | 1 | 0 |
| 2 | 2 | 0 |
| 3 | 2 | 1 |
| 4 | 2 | 2 |
| 5 | 2 | 3 |
| 6 | 3 | 3 |
| 7 | 4 | 3 |
| 8 | 4 | 4 |
| 9 | 4 | 5 |
| 10 | 4 | 6 |

The seeded "buy one, get the second half price" rule (`1` + `1`) gives 1
discounted unit for 2 or 3 red widgets, and 2 for 4.

The discount is rounded **up** to the nearest whole cent, in the customer's
favour.

For example, a 50% discount on a product costing 3295 cents is 1647.5 cents.
The discount is therefore rounded to 1648 cents, making the discounted unit
cost 1647 cents.

If several applicable `product_discount_by_quantity` rules exist, their
discounts are added together.

Seeded rule: **Buy one red widget, get the second half price**

```json
{
  "code": "red_widget_second_half_price",
  "rule": "product_discount_by_quantity",
  "data": {
    "product_code": "R01",
    "full_quantity": 1,
    "discount_quantity": 1,
    "discount_percent": 50
  },
  "precedence": 0,
  "label": "offer",
  "name": "Buy one red widget, get the second half price"
}
```

### `delivery_price_by_subtotal`

Sets the delivery charge when the current basket subtotal falls within a
configured range.

Each rule represents one range.

`min_subtotal` is inclusive and `max_subtotal` is exclusive.

Either bound may be `null`:

- `min_subtotal: null` means no lower bound, equivalent to starting at `0`.
- `max_subtotal: null` means no upper bound.

| `data` key | Type | Meaning |
|---|---|---|
| `min_subtotal` | int \| null | Inclusive lower bound, in cents. `null` means no lower bound. |
| `max_subtotal` | int \| null | Exclusive upper bound, in cents. `null` means no upper bound. |
| `charge` | int | Delivery charge, in cents. |

A delivery rule applies when:

```text
(min_subtotal is null OR subtotal >= min_subtotal)
AND
(max_subtotal is null OR subtotal < max_subtotal)
```

When a matching rule runs, it sets the current delivery charge.

Multiple delivery rules may intentionally overlap. Because rules are processed
from lower to higher precedence, a higher-precedence matching rule runs later
and overrides the delivery charge set by an earlier rule.

For example, the standard delivery policy can be represented as three
overlapping rules:

```json
[
  {
    "code": "delivery_free_fallback",
    "rule": "delivery_price_by_subtotal",
    "data": {
      "min_subtotal": null,
      "max_subtotal": null,
      "charge": 0
    },
    "precedence": 100,
    "label": "policy",
    "name": "Free delivery fallback"
  },
  {
    "code": "delivery_under_90",
    "rule": "delivery_price_by_subtotal",
    "data": {
      "min_subtotal": null,
      "max_subtotal": 9000,
      "charge": 295
    },
    "precedence": 110,
    "label": "policy",
    "name": "Delivery under $90"
  },
  {
    "code": "delivery_under_50",
    "rule": "delivery_price_by_subtotal",
    "data": {
      "min_subtotal": null,
      "max_subtotal": 5000,
      "charge": 495
    },
    "precedence": 120,
    "label": "policy",
    "name": "Delivery under $50"
  }
]
```

For a subtotal of `4942`:

1. The fallback rule sets delivery to `0`.
2. The under-$90 rule sets delivery to `295`.
3. The under-$50 rule sets delivery to `495`.

The final delivery charge is therefore `495`.

For a subtotal of `6000`:

1. The fallback rule sets delivery to `0`.
2. The under-$90 rule sets delivery to `295`.
3. The under-$50 rule does not match.

The final delivery charge is therefore `295`.

For a subtotal of `9000` or more, only the fallback rule matches, so delivery
remains free.

| Subtotal after applicable earlier discounts | Delivery |
|---|---|
| under $50.00 | $4.95 |
| $50.00 to $89.99 | $2.95 |
| $90.00 and over | free |

Delivery rules use the subtotal **after discounts applied by earlier rules**.

This is why product discount rules must have lower precedence than the delivery
rules that should observe those discounts.

For example, two red widgets have a raw subtotal of 6590 cents. The
`product_discount_by_quantity` rule runs first and applies a 1648-cent
discount, leaving a current subtotal of 4942 cents.

The delivery rules then evaluate that 4942-cent subtotal, resulting in a
495-cent delivery charge.

The final total is:

```text
6590 - 1648 + 495 = 5437
```

or `$54.37`.

## Adding a new rule type

1. Choose a `rule` name and define the `data` keys it requires.
2. Add a branch for the new rule to the `match` in `Basket::computeTotal()`.
3. Add a private method implementing the calculation.
4. Validate all required `data`. Throw `InvalidArgumentException` when required
   data is missing or invalid rather than silently ignoring the rule.
5. Choose the rule's `precedence` based on when it should execute relative to
   existing rules.
   - Lower precedence runs earlier.
   - Higher precedence runs later.
   - Use higher precedence when a rule must override state produced by another
     rule.
   - Rules that change the effective subtotal must run before rules that need
     to observe that changed subtotal.
6. Add tests to `tests/Domain/BasketTest.php`.
7. Document the new rule here.

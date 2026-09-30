<?php

declare(strict_types=1);

namespace Acme\Widget\Domain\Models;

/**
 * Describes a pricing rule that may modify the cost of a basket.
 *
 * ChargeRule is intentionally data-only. It does not contain calculation
 * logic. Basket interprets the value of `$rule` and uses `$data` as the
 * parameters required by that rule.
 *
 * Rule names:
 * - product_discount_by_quantity
 * - delivery_price_by_subtotal
 *
 * See docs/charge-rules.md for each rule's `data` and the calculation order.
 *
 * `code` is a unique, stable business key (e.g. `delivery_under_50`). It
 * identifies the rule when upserting, so callers never need the generated `id`.
 *
 * `label` and `name` are optional business-facing metadata and must not
 * affect calculation behavior.
 *
 * `precedence` controls the order in which active rules are applied: lowest
 * first, ties broken by `id` ascending. Later rules may override earlier ones.
 *
 * `startsAt` and `endsAt` optionally restrict when a rule is active.
 */
final readonly class ChargeRule
{
    public function __construct(
        public string $id,
        public string $code,
        public string $rule,
        public array $data,
        public int $precedence = 0,
        public ?string $label = null,
        public ?string $name = null,
        public ?string $startsAt = null,
        public ?string $endsAt = null,
    ) {
    }
}
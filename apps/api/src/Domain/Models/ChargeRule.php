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
 * Examples of rule names:
 * - product_discount_by_quantity
 * - delivery_discount_by_subtotal
 *
 * `label` and `name` are optional business-facing metadata and must not
 * affect calculation behavior.
 *
 * `priority` controls the order in which applicable rules are evaluated.
 *
 * `startsAt` and `endsAt` optionally restrict when a rule is active.
 */
final readonly class ChargeRule
{
    public function __construct(
        public string $id,
        public string $rule,
        public array $data,
        public int $priority = 0,
        public ?string $label = null,
        public ?string $name = null,
        public ?string $startsAt = null,
        public ?string $endsAt = null,
    ) {
    }
}
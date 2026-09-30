<?php

declare(strict_types=1);

namespace Acme\Widget\Domain\Models;

/**
 * A product in the catalog.
 *
 * `code` is the unique business identifier (e.g. R01) used by carts and
 * charge rules to refer to a product. `id` is the storage identifier.
 *
 * `priceCents` is the unit price in cents, before any discounts or delivery
 * charges are applied.
 */
final readonly class Product
{
    public function __construct(
        public string $id,
        public string $code,
        public string $name,
        public int $priceCents,
    ) {
    }
}
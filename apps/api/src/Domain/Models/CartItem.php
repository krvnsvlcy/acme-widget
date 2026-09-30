<?php

declare(strict_types=1);

namespace Acme\Widget\Domain\Models;

/**
 * A single product line within a cart.
 *
 * CartItem is data-only and holds no price. Price is resolved from the
 * catalog by `productCode` when Basket calculates totals, so a cart always
 * reflects current product prices.
 *
 * A cart holds at most one item per product; `quantity` is the number of
 * units of that product. Setting the quantity replaces the previous value
 * rather than adding to it, and a quantity of 0 removes the item.
 */
final readonly class CartItem
{
    public function __construct(
        public string $id,
        public string $cartId,
        public string $productCode,
        public int $quantity,
    ) {
    }
}
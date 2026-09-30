<?php

declare(strict_types=1);

namespace Acme\Widget\Domain\Models;

/**
 * Represents a persisted shopping cart.
 *
 * Cart intentionally contains no item or pricing logic.
 * Cart items are stored and retrieved separately, while Basket
 * is responsible for price calculation.
 *
 * `ownerRef` identifies the current owner of the cart. It is not a raw
 * database id but a typed reference combining the owner type and its id,
 * e.g. `ses_123` for an anonymous session or `usr_123` for a user.
 */
final readonly class Cart
{
    public function __construct(
        public string $id,
        public string $ownerRef,
    ) {
    }
}
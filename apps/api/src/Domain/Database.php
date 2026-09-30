<?php

declare(strict_types=1);

namespace Acme\Widget\Domain;

use Acme\Widget\Domain\Models\Cart;
use Acme\Widget\Domain\Models\CartItem;
use Acme\Widget\Domain\Models\ChargeRule;
use Acme\Widget\Domain\Models\Product;

interface Database
{
    public function getCart(string $ownerRef): ?Cart;

    public function createCart(string $ownerRef): Cart;

    /** @return list<CartItem> */
    public function listCartItems(string $cartId): array;

    public function upsertCartItem(
        string $cartId,
        string $productCode,
        int $quantity,
    ): void;

    public function removeCartItem(
        string $cartId,
        string $productCode,
    ): void;

    public function getProduct(string $code): ?Product;

    /** @return list<Product> */
    public function listProducts(): array;

    /** @return list<ChargeRule> */
    public function getChargeRules(): array;
}

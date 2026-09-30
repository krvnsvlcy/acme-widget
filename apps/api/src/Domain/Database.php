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

    /** Inserts the product, or updates the existing one with the same code. */
    public function upsertProduct(string $code, string $name, int $price): Product;

    /** @return list<ChargeRule> ordered by id */
    public function getChargeRules(): array;

    /**
     * Inserts the rule, or updates the existing one with the same code.
     *
     * @param array<string, mixed> $data
     */
    public function upsertChargeRule(
        string $code,
        string $rule,
        array $data,
        int $precedence = 0,
        ?string $label = null,
        ?string $name = null,
        ?string $startsAt = null,
        ?string $endsAt = null,
    ): ChargeRule;
}

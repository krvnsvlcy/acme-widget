<?php

declare(strict_types=1);

namespace Acme\Widget\Databases\InMemory;

use Acme\Widget\Domain\Database;
use Acme\Widget\Domain\Models\Cart;
use Acme\Widget\Domain\Models\CartItem;
use Acme\Widget\Domain\Models\ChargeRule;
use Acme\Widget\Domain\Models\Product;

final class InMemoryDatabase implements Database
{
    /** @var array<string, Product> keyed by code */
    private array $products = [];

    /** @var array<string, ChargeRule> keyed by code, in insertion (id) order */
    private array $chargeRules = [];

    /** @var array<string, Cart> keyed by owner ref */
    private array $carts = [];

    /** @var array<string, array<string, CartItem>> cart id => product code => item */
    private array $items = [];

    private int $nextId = 1;

    public function getCart(string $ownerRef): ?Cart
    {
        return $this->carts[$ownerRef] ?? null;
    }

    public function createCart(string $ownerRef): Cart
    {
        return $this->carts[$ownerRef] = new Cart((string) $this->nextId++, $ownerRef);
    }

    public function listCartItems(string $cartId): array
    {
        return array_values($this->items[$cartId] ?? []);
    }

    public function upsertCartItem(string $cartId, string $productCode, int $quantity): void
    {
        $existing = $this->items[$cartId][$productCode] ?? null;

        $this->items[$cartId][$productCode] = new CartItem(
            $existing?->id ?? (string) $this->nextId++,
            $cartId,
            $productCode,
            $quantity,
        );
    }

    public function removeCartItem(string $cartId, string $productCode): void
    {
        unset($this->items[$cartId][$productCode]);
    }

    public function getProduct(string $code): ?Product
    {
        return $this->products[$code] ?? null;
    }

    public function listProducts(): array
    {
        return array_values($this->products);
    }

    public function upsertProduct(string $code, string $name, int $price): Product
    {
        $id = $this->products[$code]->id ?? (string) $this->nextId++;

        return $this->products[$code] = new Product($id, $code, $name, $price);
    }

    public function getChargeRules(): array
    {
        return array_values($this->chargeRules);
    }

    public function upsertChargeRule(
        string $code,
        string $rule,
        array $data,
        int $precedence = 0,
        ?string $label = null,
        ?string $name = null,
        ?string $startsAt = null,
        ?string $endsAt = null,
    ): ChargeRule {
        $id = $this->chargeRules[$code]->id ?? (string) $this->nextId++;

        return $this->chargeRules[$code] = new ChargeRule(
            $id, $code, $rule, $data, $precedence, $label, $name, $startsAt, $endsAt,
        );
    }
}

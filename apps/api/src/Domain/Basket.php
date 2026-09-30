<?php

declare(strict_types=1);

namespace Acme\Widget\Domain;

use Acme\Widget\Domain\Models\ChargeRule;
use Acme\Widget\Domain\Models\Product;
use DateTimeImmutable;
use InvalidArgumentException;

final class Basket
{
    /** @var array<string, int> product code => quantity */
    private array $items = [];

    /**
     * @param DateTimeImmutable|null $at Moment used to decide which rules are
     *                                   active. Defaults to now.
     */
    public function __construct(
        private readonly Catalog $catalog,
        private readonly ?DateTimeImmutable $at = null,
    ) {
    }

    /**
     * Sets the quantity of a product, replacing any previous quantity. A
     * quantity of 0 removes the product. The product code is not checked
     * until the total is computed.
     */
    public function set(string $productCode, int $quantity): void
    {
        if ($quantity < 0) {
            throw new InvalidArgumentException('quantity must be >= 0');
        }

        if ($quantity === 0) {
            unset($this->items[$productCode]);
        } else {
            $this->items[$productCode] = $quantity;
        }
    }

    /** @throws Exceptions\ProductNotFoundException */
    public function computeTotal(): BasketTotal
    {
        if ($this->items === []) {
            return new BasketTotal(0, 0, 0, 0);
        }

        $products = [];
        $subtotal = 0;
        foreach ($this->items as $code => $quantity) {
            $products[$code] = $this->catalog->getProduct((string) $code);
            $subtotal += $products[$code]->price * $quantity;
        }
        $discount = 0;
        $delivery = 0;

        foreach ($this->getActiveRules() as $rule) {
            match ($rule->rule) {
                'product_discount_by_quantity'
                => $discount += $this->productDiscountByQuantity($rule, $products),
                'delivery_price_by_subtotal'
                => $delivery = $this->deliveryPriceBySubtotal($rule, $subtotal - $discount) ?? $delivery,
                default => throw new InvalidArgumentException(
                    "Unknown charge rule: {$rule->rule}"
                ),
            };
        }

        return new BasketTotal($subtotal, $discount, $delivery, $subtotal - $discount + $delivery);
    }

    /**
     * Rules that are active right now, lowest precedence first, ties broken by
     * id. Later rules may override earlier ones, so offers must have a lower
     * precedence than delivery rules for delivery to see the discounted subtotal.
     *
     * @return list<ChargeRule>
     */
    private function getActiveRules(): array
    {
        $now = $this->at ?? new DateTimeImmutable();

        $rules = array_values(array_filter(
            $this->catalog->getChargeRules(),
            static fn(ChargeRule $rule): bool =>
                ($rule->startsAt === null || $now >= new DateTimeImmutable($rule->startsAt))
                && ($rule->endsAt === null || $now <= new DateTimeImmutable($rule->endsAt)),
        ));

        usort(
            $rules,
            static fn(ChargeRule $a, ChargeRule $b): int =>
                [$a->precedence, $a->id] <=> [$b->precedence, $b->id],
        );

        return $rules;
    }

    /**
     * data: product_code, full_quantity, discount_quantity, discount_percent
     *
     * After each `full_quantity` units at full price, up to the next
     * `discount_quantity` units get `discount_percent` off, and the pattern
     * repeats. A partial group still gets its discounted units once
     * `full_quantity` is reached ("buy 2, then up to 3 at 50% off" with 4 units
     * discounts 2). "Buy one, get the second half price" is 1 + 1 at 50%.
     * The discount is rounded up to the cent, so the discounted unit price is
     * rounded down.
     *
     * @param array<string, Product> $products product code => product
     */
    private function productDiscountByQuantity(ChargeRule $rule, array $products): int
    {
        $code = $rule->data['product_code']
            ?? throw new InvalidArgumentException('product_code is required');

        $fullQuantity = $rule->data['full_quantity']
            ?? throw new InvalidArgumentException('full_quantity is required');

        $discountQuantity = $rule->data['discount_quantity']
            ?? throw new InvalidArgumentException('discount_quantity is required');

        $percent = $rule->data['discount_percent']
            ?? throw new InvalidArgumentException('discount_percent is required');

        if (!is_string($code) || $code === '') {
            throw new InvalidArgumentException(
                'product_code must be a non-empty string'
            );
        }

        if (!is_int($fullQuantity) || $fullQuantity < 0) {
            throw new InvalidArgumentException(
                'full_quantity must be an integer >= 0'
            );
        }

        if (!is_int($discountQuantity) || $discountQuantity < 1) {
            throw new InvalidArgumentException(
                'discount_quantity must be an integer >= 1'
            );
        }

        if (!is_int($percent) || $percent < 0 || $percent > 100) {
            throw new InvalidArgumentException(
                'discount_percent must be an integer between 0 and 100'
            );
        }

        $quantity = $this->items[$code] ?? 0;

        if ($quantity === 0) {
            return 0;
        }

        if (!isset($products[$code])) {
            throw new InvalidArgumentException(
                "Product {$code} is required by the charge rule but was not loaded"
            );
        }

        $groupSize = $fullQuantity + $discountQuantity;
        $unitPrice = $products[$code]->price;

        $remainder = $quantity % $groupSize;

        $discountedUnits =
            intdiv($quantity, $groupSize) * $discountQuantity
            + min(
                max($remainder - $fullQuantity, 0),
                $discountQuantity
            );

        $discountPerUnit = intdiv(
            $unitPrice * $percent + 99,
            100
        );

        return $discountedUnits * $discountPerUnit;
    }

    /**
     * data: min_subtotal (inclusive), max_subtotal (exclusive), charge, in
     * cents. Either bound may be null for no limit on that side.
     *
     * Returns the delivery charge when the subtotal is within range, or null
     * when it isn't, leaving the charge set by earlier rules unchanged.
     */
    private function deliveryPriceBySubtotal(
        ChargeRule $rule,
        int $subtotal
    ): ?int {
        foreach (['min_subtotal', 'max_subtotal', 'charge'] as $key) {
            if (!array_key_exists($key, $rule->data)) {
                throw new InvalidArgumentException(
                    "{$key} is required"
                );
            }
        }

        $min = $rule->data['min_subtotal'];
        $max = $rule->data['max_subtotal'];
        $charge = $rule->data['charge'];

        if ($min !== null && (!is_int($min) || $min < 0)) {
            throw new InvalidArgumentException(
                'min_subtotal must be null or an integer >= 0'
            );
        }

        if ($max !== null && (!is_int($max) || $max < 0)) {
            throw new InvalidArgumentException(
                'max_subtotal must be null or an integer >= 0'
            );
        }

        if ($min !== null && $max !== null && $min >= $max) {
            throw new InvalidArgumentException(
                'min_subtotal must be less than max_subtotal'
            );
        }

        if (!is_int($charge) || $charge < 0) {
            throw new InvalidArgumentException(
                'charge must be an integer >= 0'
            );
        }

        $matches =
            ($min === null || $subtotal >= $min)
            && ($max === null || $subtotal < $max);

        return $matches ? $charge : null;
    }
}

/** Basket price breakdown. All amounts are in cents. */
final readonly class BasketTotal
{
    public function __construct(
        public int $subtotal,
        public int $discount,
        public int $delivery,
        public int $total,
    ) {
    }
}

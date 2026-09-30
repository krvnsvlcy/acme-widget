<?php

declare(strict_types=1);

namespace Acme\Widget\Tests\Domain;

use Acme\Widget\Databases\InMemory\InMemoryDatabase;
use Acme\Widget\Databases\Seed;
use Acme\Widget\Domain\Basket;
use Acme\Widget\Domain\Catalog;
use InvalidArgumentException;
use Acme\Widget\Domain\Exceptions\ProductNotFoundException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class BasketTest extends TestCase
{
    /** @return array<string, array{list<string>, int}> */
    public static function examples(): array
    {
        return [
            'B01, G01' => [['B01', 'G01'], 3785],
            'R01, R01' => [['R01', 'R01'], 5437],
            'R01, G01' => [['R01', 'G01'], 6085],
            'B01, B01, R01, R01, R01' => [['B01', 'B01', 'R01', 'R01', 'R01'], 9827],
            'empty basket' => [[], 0],
            'four reds: two discounted' => [['R01', 'R01', 'R01', 'R01'], 3295 * 4 - 2 * 1648],
        ];
    }

    /** @param list<string> $codes */
    #[DataProvider('examples')]
    public function testTotalMatchesSpecExamples(array $codes, int $expected): void
    {
        $this->assertSame($expected, $this->basketWith($codes)->computeTotal()->total);
    }

    /**
     * The brief's interface, used literally: add() one code at a time, then total().
     *
     * @param list<string> $codes
     */
    #[DataProvider('examples')]
    public function testSpecInterfaceAddAndTotal(array $codes, int $expected): void
    {
        $basket = new Basket(new Catalog($this->seededDatabase()));
        foreach ($codes as $code) {
            $basket->add($code);
        }

        $this->assertSame($expected, $basket->total());
    }

    /** @return array<string, array{int, int}> subtotal => expected delivery */
    public static function deliveryBoundaries(): array
    {
        return [
            '$49.99 costs $4.95' => [4999, 495],
            '$50.00 costs $2.95' => [5000, 295],
            '$89.99 costs $2.95' => [8999, 295],
            '$90.00 is free' => [9000, 0],
        ];
    }

    #[DataProvider('deliveryBoundaries')]
    public function testDeliveryTierBoundaries(int $subtotal, int $expectedDelivery): void
    {
        $database = $this->seededDatabase();
        $database->upsertProduct('T01', 'Test', $subtotal);
        $basket = new Basket(new Catalog($database));
        $basket->set('T01', 1);

        $this->assertSame($expectedDelivery, $basket->computeTotal()->delivery);
        $this->assertSame($subtotal + $expectedDelivery, $basket->computeTotal()->total);
    }

    public function testTotalsBreakdown(): void
    {
        $totals = $this->basketWith(['R01', 'R01'])->computeTotal();

        $this->assertSame(6590, $totals->subtotal);
        $this->assertSame(1648, $totals->discount);
        $this->assertSame(495, $totals->delivery);
        $this->assertSame(5437, $totals->total);
    }

    public function testSetReplacesQuantity(): void
    {
        $basket = new Basket(new Catalog($this->seededDatabase()));
        $basket->set('R01', 5);
        $basket->set('R01', 2);

        $this->assertSame(5437, $basket->computeTotal()->total);
    }

    public function testSetZeroRemovesProduct(): void
    {
        $basket = new Basket(new Catalog($this->seededDatabase()));
        $basket->set('R01', 2);
        $basket->set('R01', 0);

        $this->assertSame(0, $basket->computeTotal()->total);
    }

    public function testSetNegativeQuantityThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new Basket(new Catalog($this->seededDatabase())))->set('R01', -1);
    }

    public function testUnknownProductThrows(): void
    {
        $this->expectException(ProductNotFoundException::class);

        $this->basketWith(['X99'])->computeTotal();
    }

    /** @return array<string, array{int, int}> units => expected discounted units */
    public static function quantityGroups(): array
    {
        return [
            '1 unit' => [1, 0],
            '2 units' => [2, 0],
            '3 units' => [3, 1],
            '4 units: partial group' => [4, 2],
            '5 units: one full group' => [5, 3],
            '6 units' => [6, 3],
            '7 units' => [7, 3],
            '8 units' => [8, 4],
            '9 units' => [9, 5],
            '10 units: two full groups' => [10, 6],
        ];
    }

    #[DataProvider('quantityGroups')]
    public function testDiscountedUnitsRepeatAfterFullPriceUnits(int $units, int $expectedDiscountedUnits): void
    {
        $basket = $this->basketWithRules([
            ['rule' => 'product_discount_by_quantity', 'data' => [
                'product_code' => 'T01',
                'full_quantity' => 2,
                'discount_quantity' => 3,
                'discount_percent' => 100,
            ]],
        ]);
        $basket->set('T01', $units);

        $this->assertSame($expectedDiscountedUnits * 1000, $basket->computeTotal()->discount);
    }

    public function testLaterDeliveryRuleOverridesEarlierOne(): void
    {
        $basket = $this->basketWithRules([
            $this->deliveryRule(20, null, 5000, 700),
            $this->deliveryRule(10, null, null, 100),
        ]);
        $basket->set('T01', 1);

        $this->assertSame(700, $basket->computeTotal()->delivery);
    }

    public function testNonMatchingDeliveryRuleKeepsEarlierCharge(): void
    {
        $basket = $this->basketWithRules([
            $this->deliveryRule(0, null, null, 100),
            $this->deliveryRule(10, 5000, null, 700),
        ]);
        $basket->set('T01', 1);

        $this->assertSame(100, $basket->computeTotal()->delivery);
    }

    public function testEqualPrecedenceIsOrderedById(): void
    {
        // Ten rules so ids 9 and 10 exist: ids must compare as numbers, not strings.
        $basket = $this->basketWithRules(array_map(
            fn (int $charge): array => $this->deliveryRule(0, null, null, $charge),
            range(1, 10),
        ));
        $basket->set('T01', 1);

        $this->assertSame(10, $basket->computeTotal()->delivery);
    }

    public function testDeliveryRuleMissingBoundThrows(): void
    {
        $basket = $this->basketWithRules([
            ['rule' => 'delivery_price_by_subtotal', 'data' => ['min_subtotal' => null, 'charge' => 100]],
        ]);
        $basket->set('T01', 1);

        $this->expectException(InvalidArgumentException::class);
        $basket->computeTotal();
    }

    public function testUnknownRuleThrows(): void
    {
        $basket = $this->basketWithRules([['rule' => 'mystery_rule', 'data' => []]]);
        $basket->set('T01', 1);

        $this->expectException(InvalidArgumentException::class);
        $basket->computeTotal();
    }

    private function seededDatabase(): InMemoryDatabase
    {
        $database = new InMemoryDatabase();
        Seed::run($database);

        return $database;
    }

    /**
     * Basket over a single 1000-cent product, T01, with only the given rules.
     * Rules are inserted in order, so ids ascend in list order. Each rule gets
     * the code `rule_<n>` unless it sets one.
     *
     * @param list<array<string, mixed>> $rules upsertChargeRule() named arguments
     */
    private function basketWithRules(array $rules): Basket
    {
        $database = new InMemoryDatabase();
        $database->upsertProduct('T01', 'Test', 1000);
        foreach ($rules as $i => $rule) {
            $database->upsertChargeRule(...['code' => "rule_{$i}", ...$rule]);
        }

        return new Basket(new Catalog($database));
    }

    /** @return array<string, mixed> upsertChargeRule() named arguments */
    private function deliveryRule(int $precedence, ?int $min, ?int $max, int $charge): array
    {
        return [
            'rule' => 'delivery_price_by_subtotal',
            'data' => ['min_subtotal' => $min, 'max_subtotal' => $max, 'charge' => $charge],
            'precedence' => $precedence,
        ];
    }

    /** @param list<string> $codes */
    private function basketWith(array $codes): Basket
    {
        $basket = new Basket(new Catalog($this->seededDatabase()));
        foreach (array_count_values($codes) as $code => $quantity) {
            $basket->set((string) $code, $quantity);
        }

        return $basket;
    }
}

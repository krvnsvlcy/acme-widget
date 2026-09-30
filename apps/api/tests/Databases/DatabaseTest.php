<?php

declare(strict_types=1);

namespace Acme\Widget\Tests\Databases;

use Acme\Widget\Databases\InMemory\InMemoryDatabase;
use Acme\Widget\Databases\Seed;
use Acme\Widget\Databases\Sqlite\SqliteDatabase;
use Acme\Widget\Domain\Database;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/** Both implementations must behave identically. */
final class DatabaseTest extends TestCase
{
    /** @return array<string, array{Database}> Seeded databases. */
    public static function databases(): array
    {
        $databases = [
            'in memory' => new InMemoryDatabase(),
            'sqlite' => new SqliteDatabase(':memory:'),
        ];
        foreach ($databases as $database) {
            Seed::run($database);
        }

        return array_map(static fn (Database $database): array => [$database], $databases);
    }

    #[DataProvider('databases')]
    public function testCatalogueIsSeeded(Database $db): void
    {
        $this->assertSame(['R01', 'G01', 'B01'], array_map(fn ($p) => $p->code, $db->listProducts()));
        $this->assertSame(3295, $db->getProduct('R01')?->price);
        $this->assertNull($db->getProduct('X99'));
        $this->assertCount(4, $db->getChargeRules());
    }

    #[DataProvider('databases')]
    public function testSeedCanRunAgainWithoutDuplicating(Database $db): void
    {
        $idsBefore = array_map(fn ($r) => $r->id, $db->getChargeRules());

        Seed::run($db);

        $this->assertCount(3, $db->listProducts());
        $this->assertSame($idsBefore, array_map(fn ($r) => $r->id, $db->getChargeRules()));
    }

    #[DataProvider('databases')]
    public function testUpsertProductUpdatesByCode(Database $db): void
    {
        $before = $db->getProduct('R01');

        $after = $db->upsertProduct('R01', 'Ruby Widget', 3000);

        $this->assertSame($before?->id, $after->id);
        $this->assertSame('Ruby Widget', $db->getProduct('R01')?->name);
        $this->assertSame(3000, $db->getProduct('R01')?->price);
    }

    #[DataProvider('databases')]
    public function testUpsertChargeRuleUpdatesByCode(Database $db): void
    {
        $created = $db->upsertChargeRule('test_rule', 'mystery_rule', ['a' => 1], precedence: 5, name: 'Test');
        $this->assertSame('test_rule', $created->code);
        $this->assertCount(5, $db->getChargeRules());

        $updated = $db->upsertChargeRule('test_rule', 'mystery_rule', ['a' => 2], precedence: 6);

        $this->assertSame($created->id, $updated->id);
        $this->assertSame(['a' => 2], $updated->data);
        $this->assertSame(6, $updated->precedence);
        $this->assertNull($updated->name);
        $this->assertCount(5, $db->getChargeRules());
    }

    #[DataProvider('databases')]
    public function testCartItemLifecycle(Database $db): void
    {
        $this->assertNull($db->getCart('ses_1'));

        $cart = $db->createCart('ses_1');
        $this->assertSame($cart->id, $db->getCart('ses_1')?->id);

        $db->upsertCartItem($cart->id, 'R01', 1);
        $db->upsertCartItem($cart->id, 'G01', 2);
        $db->upsertCartItem($cart->id, 'R01', 3);

        $items = $db->listCartItems($cart->id);
        $this->assertSame(['R01' => 3, 'G01' => 2], array_column(
            array_map(fn ($i) => ['c' => $i->productCode, 'q' => $i->quantity], $items),
            'q',
            'c',
        ));

        $db->removeCartItem($cart->id, 'R01');
        $this->assertCount(1, $db->listCartItems($cart->id));
    }
}

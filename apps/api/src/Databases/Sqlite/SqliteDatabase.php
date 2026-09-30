<?php

declare(strict_types=1);

namespace Acme\Widget\Databases\Sqlite;

use Acme\Widget\Domain\Database;
use Acme\Widget\Domain\Models\Cart;
use Acme\Widget\Domain\Models\CartItem;
use Acme\Widget\Domain\Models\ChargeRule;
use Acme\Widget\Domain\Models\Product;
use PDO;

final class SqliteDatabase implements Database
{
    private readonly PDO $pdo;

    /** @param string $path File path, or ':memory:'. */
    public function __construct(string $path)
    {
        if ($path !== ':memory:' && !is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        $this->pdo = new PDO('sqlite:' . $path, options: [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $this->migrate();
    }

    public function getCart(string $ownerRef): ?Cart
    {
        $row = $this->fetchOne('SELECT id, owner_ref FROM carts WHERE owner_ref = ?', [$ownerRef]);

        return $row === null ? null : new Cart((string) $row['id'], $row['owner_ref']);
    }

    public function createCart(string $ownerRef): Cart
    {
        $this->pdo->prepare('INSERT INTO carts (owner_ref) VALUES (?)')->execute([$ownerRef]);

        return new Cart($this->pdo->lastInsertId(), $ownerRef);
    }

    public function listCartItems(string $cartId): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, cart_id, product_code, quantity FROM cart_items WHERE cart_id = ? ORDER BY id'
        );
        $statement->execute([$cartId]);

        return array_map(
            static fn (array $row): CartItem => new CartItem(
                (string) $row['id'],
                (string) $row['cart_id'],
                $row['product_code'],
                (int) $row['quantity'],
            ),
            $statement->fetchAll(),
        );
    }

    public function upsertCartItem(string $cartId, string $productCode, int $quantity): void
    {
        $this->pdo->prepare(
            'INSERT INTO cart_items (cart_id, product_code, quantity) VALUES (?, ?, ?)
             ON CONFLICT (cart_id, product_code) DO UPDATE SET quantity = excluded.quantity'
        )->execute([$cartId, $productCode, $quantity]);
    }

    public function removeCartItem(string $cartId, string $productCode): void
    {
        $this->pdo->prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_code = ?')
            ->execute([$cartId, $productCode]);
    }

    public function getProduct(string $code): ?Product
    {
        $row = $this->fetchOne('SELECT * FROM products WHERE code = ?', [$code]);

        return $row === null ? null : $this->productFromRow($row);
    }

    public function listProducts(): array
    {
        return array_map(
            $this->productFromRow(...),
            $this->pdo->query('SELECT * FROM products ORDER BY id')->fetchAll(),
        );
    }

    public function upsertProduct(string $code, string $name, int $price): Product
    {
        $this->pdo->prepare(
            'INSERT INTO products (code, name, price) VALUES (?, ?, ?)
             ON CONFLICT (code) DO UPDATE SET name = excluded.name, price = excluded.price'
        )->execute([$code, $name, $price]);

        return $this->getProduct($code);
    }

    public function getChargeRules(): array
    {
        return array_map(
            $this->chargeRuleFromRow(...),
            $this->pdo->query('SELECT * FROM charge_rules ORDER BY id')->fetchAll(),
        );
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
        $this->pdo->prepare(
            'INSERT INTO charge_rules (code, rule, data, precedence, label, name, starts_at, ends_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (code) DO UPDATE SET
                 rule = excluded.rule,
                 data = excluded.data,
                 precedence = excluded.precedence,
                 label = excluded.label,
                 name = excluded.name,
                 starts_at = excluded.starts_at,
                 ends_at = excluded.ends_at'
        )->execute([$code, $rule, json_encode($data, JSON_THROW_ON_ERROR), $precedence, $label, $name, $startsAt, $endsAt]);

        return $this->chargeRuleFromRow($this->fetchOne('SELECT * FROM charge_rules WHERE code = ?', [$code]));
    }

    /** @param array<string, mixed> $row */
    private function productFromRow(array $row): Product
    {
        return new Product((string) $row['id'], $row['code'], $row['name'], (int) $row['price']);
    }

    /** @param array<string, mixed> $row */
    private function chargeRuleFromRow(array $row): ChargeRule
    {
        return new ChargeRule(
            id: (string) $row['id'],
            code: $row['code'],
            rule: $row['rule'],
            data: json_decode($row['data'], true, flags: JSON_THROW_ON_ERROR),
            precedence: (int) $row['precedence'],
            label: $row['label'],
            name: $row['name'],
            startsAt: $row['starts_at'],
            endsAt: $row['ends_at'],
        );
    }

    /**
     * @param list<string> $params
     * @return array<string, mixed>|null
     */
    private function fetchOne(string $sql, array $params): ?array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetch() ?: null;
    }

    private function migrate(): void
    {
        $this->pdo->exec(<<<'SQL'
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                price INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS charge_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                rule TEXT NOT NULL,
                data TEXT NOT NULL,
                precedence INTEGER NOT NULL DEFAULT 0,
                label TEXT,
                name TEXT,
                starts_at TEXT,
                ends_at TEXT
            );
            CREATE TABLE IF NOT EXISTS carts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_ref TEXT NOT NULL UNIQUE
            );
            CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cart_id INTEGER NOT NULL REFERENCES carts (id),
                product_code TEXT NOT NULL REFERENCES products (code),
                quantity INTEGER NOT NULL,
                UNIQUE (cart_id, product_code)
            );
            SQL);
    }
}

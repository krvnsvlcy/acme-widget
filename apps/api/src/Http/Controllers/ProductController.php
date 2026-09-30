<?php

declare(strict_types=1);

namespace Acme\Widget\Http\Controllers;

use Acme\Widget\Domain\Database;
use Acme\Widget\Domain\Models\Product;
use Acme\Widget\Http\Response;

final class ProductController
{
    public function __construct(private readonly Database $database)
    {
    }

    public function index(): void
    {
        Response::json(array_map(self::present(...), $this->database->listProducts()));
    }

    public function show(string $productCode): void
    {
        $product = $this->database->getProduct($productCode);

        $product === null
            ? Response::error("Unknown product: {$productCode}", 404)
            : Response::json(self::present($product));
    }

    /** @return array<string, mixed> */
    public static function present(Product $product): array
    {
        return [
            'id' => $product->id,
            'code' => $product->code,
            'name' => $product->name,
            'price' => $product->price,
        ];
    }
}

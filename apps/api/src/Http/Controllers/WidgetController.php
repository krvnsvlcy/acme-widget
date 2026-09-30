<?php

declare(strict_types=1);

namespace Acme\Widget\Http\Controllers;

use Acme\Widget\Domain\Database;
use Acme\Widget\Domain\Models\Product;
use Acme\Widget\Http\Response;

final class WidgetController
{
    public function __construct(private readonly Database $database)
    {
    }

    public function index(): void
    {
        Response::json(array_map(self::present(...), $this->database->listProducts()));
    }

    /** `$widgetId` is the product code, e.g. R01. */
    public function show(string $widgetId): void
    {
        $product = $this->database->getProduct($widgetId);

        $product === null
            ? Response::error("Unknown widget: {$widgetId}", 404)
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

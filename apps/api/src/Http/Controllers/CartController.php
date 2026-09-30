<?php

declare(strict_types=1);

namespace Acme\Widget\Http\Controllers;

use Acme\Widget\Domain\Basket;
use Acme\Widget\Domain\Catalog;
use Acme\Widget\Domain\Database;
use Acme\Widget\Domain\Models\Cart;
use Acme\Widget\Http\Response;

final class CartController
{
    private const MAX_QUANTITY = 99;

    public function __construct(
        private readonly Database $database,
        private readonly Catalog $catalog,
    ) {
    }

    public function show(): void
    {
        $this->respondWithCart($this->database->getCart(self::ownerRef()));
    }

    /** Body: {"quantity": int}. Quantity 0 removes the item. */
    public function updateItem(string $widgetId): void
    {
        $body = json_decode(file_get_contents('php://input') ?: 'null', true);
        $quantity = is_array($body) ? ($body['quantity'] ?? null) : null;

        if (!is_int($quantity) || $quantity < 0 || $quantity > self::MAX_QUANTITY) {
            Response::error('quantity must be an integer between 0 and ' . self::MAX_QUANTITY, 422);
            return;
        }
        if ($this->database->getProduct($widgetId) === null) {
            Response::error("Unknown widget: {$widgetId}", 404);
            return;
        }

        $ownerRef = self::ownerRef();
        $cart = $this->database->getCart($ownerRef) ?? $this->database->createCart($ownerRef);

        $quantity === 0
            ? $this->database->removeCartItem($cart->id, $widgetId)
            : $this->database->upsertCartItem($cart->id, $widgetId, $quantity);

        $this->respondWithCart($cart);
    }

    public function removeItem(string $widgetId): void
    {
        $cart = $this->database->getCart(self::ownerRef());

        if ($cart !== null) {
            $this->database->removeCartItem($cart->id, $widgetId);
        }

        $this->respondWithCart($cart);
    }

    private function respondWithCart(?Cart $cart): void
    {
        $items = $cart === null ? [] : $this->database->listCartItems($cart->id);
        $basket = new Basket($this->catalog);
        $lines = [];

        foreach ($items as $item) {
            $product = $this->catalog->getProduct($item->productCode);
            $basket->set($item->productCode, $item->quantity);
            $lines[] = [
                'widget' => WidgetController::present($product),
                'quantity' => $item->quantity,
                'lineCents' => $product->price * $item->quantity,
            ];
        }

        $totals = $basket->computeTotal();

        Response::json([
            'items' => $lines,
            'subtotalCents' => $totals->subtotal,
            'discountCents' => $totals->discount,
            'deliveryCents' => $totals->delivery,
            'totalCents' => $totals->total,
        ]);
    }

    /** Anonymous cart owner: `ses_` + the PHP session id (cookie). */
    private static function ownerRef(): string
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start(['cookie_httponly' => true, 'cookie_samesite' => 'Lax']);
        }
        $id = session_id();
        session_write_close();

        return 'ses_' . $id;
    }
}

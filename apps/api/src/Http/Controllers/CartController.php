<?php

declare(strict_types=1);

namespace Acme\Widget\Http\Controllers;

final class CartController
{
    public function show(): void
    {
        // TODO: Return the current session cart.
        header('Content-Type: application/json');
        echo json_encode(['handler' => 'CartController::show']);
    }

    public function updateItem(string $widgetId): void
    {
        // TODO: Update the quantity of a cart item.
        header('Content-Type: application/json');
        echo json_encode([
            'handler' => 'CartController::updateItem',
            'widgetId' => $widgetId,
            'body' => json_decode(file_get_contents('php://input') ?: 'null', true),
        ]);
    }

    public function removeItem(string $widgetId): void
    {
        // TODO: Remove a widget from the current cart.
        header('Content-Type: application/json');
        echo json_encode(['handler' => 'CartController::removeItem', 'widgetId' => $widgetId]);
    }
}

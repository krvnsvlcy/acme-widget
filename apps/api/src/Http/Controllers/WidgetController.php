<?php

declare(strict_types=1);

namespace Acme\Widget\Http\Controllers;

final class WidgetController
{
    public function index(): void
    {
        // TODO: Return all available widgets.
        header('Content-Type: application/json');
        echo json_encode(['handler' => 'WidgetController::index']);
    }

    public function show(string $widgetId): void
    {
        // TODO: Return a single widget by ID.
        header('Content-Type: application/json');
        echo json_encode(['handler' => 'WidgetController::show', 'widgetId' => $widgetId]);
    }
}

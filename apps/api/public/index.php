<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Acme\Widget\Http\Controllers\CartController;
use Acme\Widget\Http\Controllers\WidgetController;
use Acme\Widget\Http\Router;

$widgetController = new WidgetController();
$cartController = new CartController();

$router = new Router();

$router->get('/api/widgets', [$widgetController, 'index']);
$router->get('/api/widgets/{widgetId}', [$widgetController, 'show']);

$router->get('/api/cart', [$cartController, 'show']);
$router->put('/api/cart/items/{widgetId}', [$cartController, 'updateItem']);
$router->delete('/api/cart/items/{widgetId}', [$cartController, 'removeItem']);

$router->handleRequest();
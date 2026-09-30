<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Acme\Widget\Databases\Seed;
use Acme\Widget\Databases\Sqlite\SqliteDatabase;
use Acme\Widget\Domain\Catalog;
use Acme\Widget\Http\Controllers\CartController;
use Acme\Widget\Http\Controllers\WidgetController;
use Acme\Widget\Http\Router;

$database = new SqliteDatabase(__DIR__ . '/../var/acme.sqlite');
Seed::run($database);
$catalog = new Catalog($database);

$widgetController = new WidgetController($database);
$cartController = new CartController($database, $catalog);

$router = new Router();

$router->get('/api/widgets', [$widgetController, 'index']);
$router->get('/api/widgets/{widgetId}', [$widgetController, 'show']);

$router->get('/api/cart', [$cartController, 'show']);
$router->put('/api/cart/items/{widgetId}', [$cartController, 'updateItem']);
$router->delete('/api/cart/items/{widgetId}', [$cartController, 'removeItem']);

$router->handleRequest();
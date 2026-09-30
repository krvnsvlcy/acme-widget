<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Acme\Widget\Databases\Seed;
use Acme\Widget\Databases\Sqlite\SqliteDatabase;
use Acme\Widget\Domain\Catalog;
use Acme\Widget\Http\Controllers\CartController;
use Acme\Widget\Http\Controllers\ProductController;
use Acme\Widget\Http\Router;

$database = new SqliteDatabase(__DIR__ . '/../var/acme.sqlite');
Seed::run($database);
$catalog = new Catalog($database);

$productController = new ProductController($database);
$cartController = new CartController($database, $catalog);

$router = new Router();

$router->get('/api/products', [$productController, 'index']);
$router->get('/api/products/{productCode}', [$productController, 'show']);

$router->get('/api/cart', [$cartController, 'show']);
$router->put('/api/cart/items/{productCode}', [$cartController, 'updateItem']);
$router->delete('/api/cart/items/{productCode}', [$cartController, 'removeItem']);

$router->handleRequest();
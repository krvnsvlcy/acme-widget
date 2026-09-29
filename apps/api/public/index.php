<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

// TODO: POST /api/basket/total consumed by apps/web.
header('Content-Type: application/json');
echo json_encode(['status' => 'ok']);

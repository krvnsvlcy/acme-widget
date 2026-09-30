<?php

declare(strict_types=1);

namespace Acme\Widget\Http;

final class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_THROW_ON_ERROR);
    }

    public static function error(string $message, int $status): void
    {
        self::json(['error' => $message], $status);
    }
}

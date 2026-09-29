<?php

declare(strict_types=1);

namespace Acme\Widget\Http;

use FastRoute\Dispatcher;
use FastRoute\RouteCollector;

use function FastRoute\simpleDispatcher;

final class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): self
    {
        return $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): self
    {
        return $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): self
    {
        return $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): self
    {
        return $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(
        string $method,
        string $path,
        callable $handler
    ): self {
        $this->routes[] = [$method, $path, $handler];

        return $this;
    }

    public function handleRequest(): void
    {
        $dispatcher = simpleDispatcher(function (RouteCollector $collector): void {
            foreach ($this->routes as [$method, $path, $handler]) {
                $collector->addRoute($method, $path, $handler);
            }
        });

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        $route = $dispatcher->dispatch(
            $method,
            rawurldecode($path)
        );

        switch ($route[0]) {
            case Dispatcher::NOT_FOUND:
                http_response_code(404);
                break;

            case Dispatcher::METHOD_NOT_ALLOWED:
                http_response_code(405);

                header('Allow: ' . implode(', ', $route[1]));
                break;

            case Dispatcher::FOUND:
                [, $handler, $parameters] = $route;

                call_user_func_array(
                    $handler,
                    array_values($parameters)
                );

                break;
        }
    }
}
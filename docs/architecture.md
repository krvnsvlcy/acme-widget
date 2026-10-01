# Architecture

Acme Widget is a two-tier system: a React single-page application communicates with a PHP JSON API, which stores its data through a database abstraction.

```text
Browser ──HTTP/JSON──▶ PHP API ──▶ Database (interface)
(React SPA)             │             ├─ SqliteDatabase   (server)
                        │             └─ InMemoryDatabase (tests)
                        │
                        ├─ Basket
                        └─ Catalog
```

## Components

### PHP API (`apps/api`)

The API runs as a single PHP application. It exposes a JSON API for products and basket operations and uses a PHP session cookie to identify an anonymous user's basket.

Persistence is accessed through the `Database` interface, keeping the domain layer independent of a specific storage implementation.

### React web app (`apps/web`)

The frontend is a Vite + React + TypeScript single-page application.

In development, Vite serves the frontend and proxies `/api` requests to the local PHP server.

In production, the compiled SPA and PHP API are served from the same origin by FrankenPHP (see [deployment](deployment.md)). API requests under `/api/*` are routed to the PHP front controller, while static assets and SPA routes are served directly by Caddy.

## Databases

The system currently supports two database implementations:

- A SQLite database provides persistent storage and is used by the running application.
- An in-memory database provides the same contract using in-memory storage and is primarily used by tests.

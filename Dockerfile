# Single image: the PHP API and the React SPA, served from one origin by
# FrankenPHP (Caddy + PHP). See Caddyfile for the routing.

# --- 1. Build the SPA -------------------------------------------------------
FROM node:24-alpine AS web
RUN npm install -g pnpm@12.4.2
WORKDIR /app/apps/web
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/web/ ./
RUN pnpm build

# --- 2. PHP dependencies (no dev packages) ----------------------------------
FROM composer:2 AS vendor
WORKDIR /app
COPY apps/api/composer.json apps/api/composer.lock ./
COPY apps/api/src ./src
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# --- 3. Runtime ---------------------------------------------------------------
FROM dunglas/frankenphp:1-php8.4

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

WORKDIR /app
COPY apps/api/src ./src
COPY apps/api/public ./public
COPY --from=vendor /app/vendor ./vendor
# The built SPA sits next to index.php: Caddy serves its files and falls back
# to its index.html; /api/* goes to index.php.
COPY --from=web /app/apps/web/dist/ ./public/
COPY Caddyfile /etc/frankenphp/Caddyfile

# SQLite lives in /app/var (created on first request). Mount a volume there
# to keep carts across deploys.
ENV PORT=8080
EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]

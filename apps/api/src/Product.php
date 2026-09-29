<?php

declare(strict_types=1);

namespace Acme\Widget;

final readonly class Product
{
    /** Price is in cents to avoid float rounding issues. */
    public function __construct(
        public string $code,
        public string $name,
        public int $priceCents,
    ) {}
}

<?php

declare(strict_types=1);

namespace Acme\Widget\Domain\Exceptions;

use DomainException;

final class ProductNotFoundException extends DomainException
{
    public function __construct(public readonly string $productCode)
    {
        parent::__construct("Unknown product code: {$productCode}");
    }
}

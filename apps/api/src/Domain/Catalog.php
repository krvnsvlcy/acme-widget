<?php

declare(strict_types=1);

namespace Acme\Widget\Domain;

use Acme\Widget\Domain\Exceptions\ProductNotFoundException;
use Acme\Widget\Domain\Models\ChargeRule;
use Acme\Widget\Domain\Models\Product;

final class Catalog
{
    public function __construct(private readonly Database $database)
    {
    }

    /** @throws ProductNotFoundException */
    public function getProduct(string $code): Product
    {
        return $this->database->getProduct($code)
            ?? throw new ProductNotFoundException($code);
    }

    /**
     * @return list<ChargeRule>
     */
    public function getChargeRules(): array
    {
        return $this->database->getChargeRules();
    }
}

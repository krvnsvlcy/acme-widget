<?php

declare(strict_types=1);

namespace Acme\Widget\Tests;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class BasketTest extends TestCase
{
    /** @return array<string, array{list<string>, string}> */
    public static function examples(): array
    {
        return [
            'B01, G01' => [['B01', 'G01'], '37.85'],
            'R01, R01' => [['R01', 'R01'], '54.37'],
            'R01, G01' => [['R01', 'G01'], '60.85'],
            'B01, B01, R01, R01, R01' => [['B01', 'B01', 'R01', 'R01', 'R01'], '98.27'],
        ];
    }

    /** @param list<string> $codes */
    #[DataProvider('examples')]
    public function testTotalMatchesSpecExamples(array $codes, string $expected): void
    {
        $this->markTestIncomplete('Basket not implemented yet.');
    }
}

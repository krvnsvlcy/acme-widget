const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const formatPrice = (cents: number) => currency.format(cents / 100)

/**
 * A colour for a product's swatch, taken from the first word of its name when
 * that word is a CSS colour ("Red Widget" → red). Otherwise null.
 */
export function swatchColor(name: string): string | null {
  const word = name.split(' ')[0]?.toLowerCase() ?? ''

  return word !== '' && CSS.supports('color', word) ? word : null
}

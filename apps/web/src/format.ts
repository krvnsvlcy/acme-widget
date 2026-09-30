const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const formatPrice = (cents: number) => currency.format(cents / 100)

/** Editorial tones, keyed by the colour word a product name starts with. */
const TONES: Record<string, string> = {
  red: '#c4452c',
  green: '#4b7355',
  blue: '#2f4f9a',
}

const NEUTRAL_TONE = '#3a3a37'

/** The palette tone for a product ("Red Widget" → the red tone), as a hex colour. */
export function productTone(name: string): string {
  const word = name.split(' ')[0]?.toLowerCase() ?? ''

  return TONES[word] ?? NEUTRAL_TONE
}

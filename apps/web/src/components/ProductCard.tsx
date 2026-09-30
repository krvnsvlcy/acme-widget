import { MAX_QUANTITY, type Product } from '../api.ts'
import { formatPrice, productTone } from '../format.ts'
import { QuantityStepper } from './QuantityStepper.tsx'

type Props = {
  product: Product
  /** Position in the catalogue, shown as the palette number (1 → "01"). */
  number: number
  quantityInBasket: number
  busy: boolean
  onSetQuantity: (quantity: number) => void
}

/**
 * A colour-chip tile, like a page from a palette book: a block of the
 * product's tone with its reference details, and a label strip below. Shows an
 * Add button until the product is in the basket, then a −/+ stepper.
 */
export function ProductCard({ product, number, quantityInBasket, busy, onSetQuantity }: Props) {
  const tone = productTone(product.name)

  return (
    <article className="flex flex-col overflow-hidden bg-surface">
      <div
        className="relative flex aspect-square flex-col justify-between p-4 text-white/85 sm:p-5"
        style={{ backgroundColor: tone }}
      >
        <div className="flex items-baseline justify-between text-[0.6875rem] tracking-wide">
          <span className="tabular-nums">no. {String(number).padStart(2, '0')}</span>
          <span>{product.code}</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-mono text-[0.6875rem] tracking-wider uppercase">{tone}</span>
          {quantityInBasket > 0 && (
            <span className="text-5xl leading-none font-medium tracking-tighter tabular-nums">
              ×{quantityInBasket}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border border-t-0 border-line p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="truncate text-2xl leading-tight font-medium tracking-tight lowercase">
            {product.name}
          </h3>
          <p className="text-lg tabular-nums">{formatPrice(product.price)}</p>
        </div>

        {quantityInBasket === 0 ? (
          <button
            type="button"
            className="h-10 w-full rounded-full border border-ink text-sm font-medium lowercase transition-colors enabled:hover:bg-ink enabled:hover:text-page disabled:opacity-40"
            aria-label={`Add ${product.name} to basket`}
            disabled={busy || quantityInBasket >= MAX_QUANTITY}
            onClick={() => onSetQuantity(1)}
          >
            add
          </button>
        ) : (
          <QuantityStepper
            className="h-10 w-full"
            label={product.name}
            quantity={quantityInBasket}
            disabled={busy}
            onChange={onSetQuantity}
          />
        )}
      </div>
    </article>
  )
}

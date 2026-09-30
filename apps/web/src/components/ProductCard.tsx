import { MAX_QUANTITY, type Product } from '../libs/api.ts'
import { selectQuantity, useStore } from '../libs/store.ts'
import { formatPrice, productTone } from '../format.ts'
import { QuantityStepper } from './QuantityStepper.tsx'

type Props = {
  product: Product
  /** Position in the catalogue, shown as the palette number (1 → "01"). */
  number: number
}

/**
 * A colour-chip tile, like a page from a palette book: a block of the
 * product's tone with its reference details, and a label strip below. Shows an
 * Add button until the product is in the basket, then a −/+ stepper.
 */
export function ProductCard({ product, number }: Props) {
  const quantityInBasket = useStore(selectQuantity(product.code))
  const setQuantity = useStore((s) => s.setQuantity)
  const onSetQuantity = (quantity: number) => setQuantity(product.code, quantity)
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
            disabled={quantityInBasket >= MAX_QUANTITY}
            onClick={() => onSetQuantity(1)}
          >
            add
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <QuantityStepper
              className="h-10 min-w-0 flex-1"
              label={product.name}
              quantity={quantityInBasket}
              onChange={onSetQuantity}
            />
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink transition-colors enabled:hover:bg-ink enabled:hover:text-page disabled:opacity-40"
              aria-label={`Remove ${product.name} from basket`}
              onClick={() => onSetQuantity(0)}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

/**
 * Placeholder with the same structure as ProductCard, so the grid keeps its
 * shape when the real cards replace it. Text is a non-breaking space so each
 * line takes the height of the text it stands in for.
 */
export function ProductCardSkeleton() {
  const bar = 'inline-block animate-pulse rounded-sm bg-muted/30'

  return (
    <article className="flex flex-col overflow-hidden bg-surface" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-muted/15" />

      <div className="flex flex-col gap-4 border border-t-0 border-line p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-2xl leading-tight font-medium tracking-tight">
            <span className={`${bar} w-32`}>&nbsp;</span>
          </h3>
          <p className="text-lg">
            <span className={`${bar} w-14`}>&nbsp;</span>
          </p>
        </div>
        <div className="h-10 w-full animate-pulse rounded-full bg-muted/30" />
      </div>
    </article>
  )
}

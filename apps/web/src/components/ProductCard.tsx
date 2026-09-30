import { MAX_QUANTITY, type Product } from '../api.ts'
import { formatPrice } from '../format.ts'
import { Swatch } from './Swatch.tsx'

type Props = {
  product: Product
  quantityInBasket: number
  busy: boolean
  onAdd: () => void
}

/**
 * A compact row on phones (swatch | name | price, button underneath), and a
 * vertical card from `sm` up.
 */
export function ProductCard({ product, quantityInBasket, busy, onAdd }: Props) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3.5 gap-y-2.5 rounded-xl border border-line bg-surface p-4 shadow-card sm:flex sm:flex-col sm:gap-3 sm:p-5">
      <Swatch name={product.name} className="row-span-2" />
      <div>
        <h3 className="font-semibold">{product.name}</h3>
        <span className="font-mono text-[0.8125rem] text-muted">{product.code}</span>
      </div>
      <p className="text-lg font-semibold tabular-nums sm:text-xl">{formatPrice(product.price)}</p>
      <button
        type="button"
        className="col-span-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-on-accent transition-colors enabled:hover:bg-accent-hover disabled:opacity-50"
        disabled={busy || quantityInBasket >= MAX_QUANTITY}
        onClick={onAdd}
      >
        Add to basket
      </button>
      <p
        className="col-span-2 col-start-2 -mt-1 text-[0.8125rem] text-muted empty:hidden sm:block sm:min-h-[1.5em] sm:text-center"
        aria-live="polite"
      >
        {quantityInBasket > 0 ? `${quantityInBasket} in basket` : ''}
      </p>
    </article>
  )
}

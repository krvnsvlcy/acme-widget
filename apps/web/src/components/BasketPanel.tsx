import type { Cart } from '../api.ts'
import { formatPrice, productTone } from '../format.ts'
import { Ring } from './Ring.tsx'

type Props = {
  /** null while loading. */
  cart: Cart | null
  className?: string
}

/** Read-only basket: a scrollable list of lines with the totals pinned below. */
export function BasketPanel({ cart, className = '' }: Props) {
  const items = cart?.items ?? []
  const itemCount = items.reduce((count, line) => count + line.quantity, 0)

  return (
    <aside
      className={`flex min-h-0 flex-col border-t border-line bg-surface md:border-t-0 md:border-l ${className}`}
      aria-labelledby="basket-title"
    >
      <header className="flex shrink-0 items-baseline justify-between px-6 pt-5 pb-2 md:px-8 md:pt-6">
        <h2 id="basket-title" className="text-3xl font-medium tracking-tight lowercase md:text-4xl">
          basket
        </h2>
        <span className="text-xs text-muted tabular-nums">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 md:px-8">
        {cart === null ? (
          <p className="py-4 text-sm text-muted">loading…</p>
        ) : items.length === 0 ? (
          // Fills the whole scroll area, centred both ways.
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
            <Ring className="size-16" />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted">Your basket is empty.</p>
              <p className="max-w-60 text-xs text-balance text-faint">
                Press <span className="text-muted">add</span> on any widget to put it in your
                basket.
              </p>
            </div>
          </div>
        ) : (
          <ul>
            {items.map(({ product, quantity, lineCents }) => (
              <li
                key={product.code}
                className="flex items-center gap-3 border-b border-line py-4 last:border-b-0"
              >
                <Ring filled color={productTone(product.name)} className="size-5" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate lowercase">{product.name}</span>
                  <span className="text-xs text-muted tabular-nums">
                    {quantity} × {formatPrice(product.price)}
                  </span>
                </div>
                <span className="tabular-nums">{formatPrice(lineCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cart !== null && (
        <footer className="shrink-0 border-t border-line px-6 pt-4 pb-5 md:px-8 md:pb-6">
          <dl className="text-sm [&_dd]:tabular-nums [&>div]:flex [&>div]:justify-between [&>div]:py-0.5">
            <div className="text-muted">
              <dt>subtotal</dt>
              <dd>{formatPrice(cart.subtotalCents)}</dd>
            </div>
            {cart.discountCents > 0 && (
              <div className="text-ink">
                <dt>offers</dt>
                <dd>−{formatPrice(cart.discountCents)}</dd>
              </div>
            )}
            <div className="text-muted">
              <dt>delivery</dt>
              <dd>
                {items.length > 0 && cart.deliveryCents === 0
                  ? 'free'
                  : formatPrice(cart.deliveryCents)}
              </dd>
            </div>
            <div className="mt-3 items-baseline border-t border-line pt-3">
              <dt className="text-muted">total</dt>
              <dd className="text-4xl font-medium tracking-tight md:text-5xl">
                {formatPrice(cart.totalCents)}
              </dd>
            </div>
          </dl>
        </footer>
      )}
    </aside>
  )
}

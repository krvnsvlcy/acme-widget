import { useStore } from '../libs/store.ts'
import { formatPrice, productTone } from '../format.ts'
import { Ring } from './Ring.tsx'

type Props = {
  className?: string
}

/**
 * Placeholder for a value that is still being calculated. It holds a non-breaking
 * space, so it takes the line height of the text around it and never shifts the
 * layout. The caller only sets the width.
 */
function Skeleton({ className }: { className: string }) {
  return (
    <span
      className={`inline-block animate-pulse rounded-xl bg-muted/30 align-baseline ${className}`}
      aria-hidden="true"
    >
      &nbsp;
    </span>
  )
}

/** Read-only basket: a scrollable list of lines with the totals pinned below. */
export function BasketPanel({ className = '' }: Props) {
  const cart = useStore((s) => s.cart)
  const status = useStore((s) => s.cartStatus)
  // Sorted by product code so the order is the same whether the lines came from
  // an optimistic edit or from the server.
  const items = (cart?.items ?? []).toSorted((a, b) => a.product.code.localeCompare(b.product.code))
  // Totals come from the server, so until it confirms the latest edits they are not trustworthy.
  const stale = status === 'loading' || status === 'saving'
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
          <p className="py-4 text-sm text-muted">
            {status === 'loading' ? 'loading…' : 'basket unavailable'}
          </p>
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
              <dd>{stale ? <Skeleton className="w-14" /> : formatPrice(cart.subtotalCents)}</dd>
            </div>
            {cart.discountCents > 0 && (
              <div className="text-ink">
                <dt>offers</dt>
                <dd>
                  {stale ? <Skeleton className="w-12" /> : `−${formatPrice(cart.discountCents)}`}
                </dd>
              </div>
            )}
            <div className="text-muted">
              <dt>delivery</dt>
              <dd>
                {stale ? (
                  <Skeleton className="w-12" />
                ) : items.length > 0 && cart.deliveryCents === 0 ? (
                  'free'
                ) : (
                  formatPrice(cart.deliveryCents)
                )}
              </dd>
            </div>
            <div className="mt-3 items-baseline border-t border-line pt-3">
              <dt className="text-muted">total</dt>
              <dd className="text-4xl font-medium tracking-tight md:text-5xl">
                {stale ? <Skeleton className="w-32" /> : formatPrice(cart.totalCents)}
              </dd>
            </div>
          </dl>
        </footer>
      )}
    </aside>
  )
}

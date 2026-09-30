import type { Cart } from '../api.ts'
import { formatPrice } from '../format.ts'
import { QuantityStepper } from './QuantityStepper.tsx'
import { Swatch } from './Swatch.tsx'

type Props = {
  cart: Cart
  busyCode: string | null
  onSetQuantity: (productCode: string, quantity: number) => void
  onRemove: (productCode: string) => void
}

export function BasketPanel({ cart, busyCode, onSetQuantity, onRemove }: Props) {
  const itemCount = cart.items.reduce((count, line) => count + line.quantity, 0)

  return (
    <aside
      className="sticky top-6 rounded-xl border border-line bg-surface p-6 shadow-card"
      aria-labelledby="basket-title"
    >
      <header className="flex items-baseline justify-between">
        <h2 id="basket-title" className="text-lg font-semibold">
          Basket
        </h2>
        <span className="text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </header>

      {cart.items.length === 0 ? (
        <p className="pt-4 pb-6 text-muted">Your basket is empty.</p>
      ) : (
        <ul className="mt-2 mb-2">
          {cart.items.map(({ product, quantity, lineCents }) => (
            <li
              key={product.code}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-line py-3.5"
            >
              <Swatch name={product.name} size="sm" className="row-span-2 self-start" />
              <div className="flex flex-col">
                <span className="font-semibold">{product.name}</span>
                <span className="text-[0.8125rem] text-muted">
                  {formatPrice(product.price)} each
                </span>
              </div>
              <button
                type="button"
                className="size-7 self-start justify-self-end rounded-full text-xl leading-none text-muted enabled:hover:bg-page enabled:hover:text-ink disabled:opacity-50"
                aria-label={`Remove ${product.name} from basket`}
                disabled={busyCode === product.code}
                onClick={() => onRemove(product.code)}
              >
                ×
              </button>
              <QuantityStepper
                className="justify-self-start"
                label={product.name}
                quantity={quantity}
                disabled={busyCode === product.code}
                onChange={(next) => onSetQuantity(product.code, next)}
              />
              <span className="justify-self-end font-semibold tabular-nums">
                {formatPrice(lineCents)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-4 [&>div]:flex [&>div]:justify-between [&>div]:py-1 [&_dd]:tabular-nums">
        <div className="text-muted">
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.subtotalCents)}</dd>
        </div>
        {cart.discountCents > 0 && (
          <div className="text-positive">
            <dt>Offers</dt>
            <dd>−{formatPrice(cart.discountCents)}</dd>
          </div>
        )}
        <div className="text-muted">
          <dt>Delivery</dt>
          <dd>
            {cart.items.length > 0 && cart.deliveryCents === 0
              ? 'Free'
              : formatPrice(cart.deliveryCents)}
          </dd>
        </div>
        <div className="mt-2 border-t border-line pt-3 text-lg font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(cart.totalCents)}</dd>
        </div>
      </dl>
    </aside>
  )
}

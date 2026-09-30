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
    <aside className="basket" aria-labelledby="basket-title">
      <header className="basket__header">
        <h2 id="basket-title">Basket</h2>
        <span className="basket__count">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </header>

      {cart.items.length === 0 ? (
        <p className="basket__empty">Your basket is empty.</p>
      ) : (
        <ul className="basket__lines">
          {cart.items.map(({ product, quantity, lineCents }) => (
            <li key={product.code} className="basket-line">
              <Swatch name={product.name} size="sm" />
              <div className="basket-line__info">
                <span className="basket-line__name">{product.name}</span>
                <span className="basket-line__unit">{formatPrice(product.price)} each</span>
              </div>
              <QuantityStepper
                label={product.name}
                quantity={quantity}
                disabled={busyCode === product.code}
                onChange={(next) => onSetQuantity(product.code, next)}
              />
              <span className="basket-line__total">{formatPrice(lineCents)}</span>
              <button
                type="button"
                className="basket-line__remove"
                aria-label={`Remove ${product.name} from basket`}
                disabled={busyCode === product.code}
                onClick={() => onRemove(product.code)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <dl className="summary">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.subtotalCents)}</dd>
        </div>
        {cart.discountCents > 0 && (
          <div className="summary__discount">
            <dt>Offers</dt>
            <dd>−{formatPrice(cart.discountCents)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>
            {cart.items.length > 0 && cart.deliveryCents === 0
              ? 'Free'
              : formatPrice(cart.deliveryCents)}
          </dd>
        </div>
        <div className="summary__total">
          <dt>Total</dt>
          <dd>{formatPrice(cart.totalCents)}</dd>
        </div>
      </dl>
    </aside>
  )
}

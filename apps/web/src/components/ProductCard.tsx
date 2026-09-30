import { MAX_QUANTITY, type Product } from '../api.ts'
import { formatPrice } from '../format.ts'
import { Swatch } from './Swatch.tsx'

type Props = {
  product: Product
  quantityInBasket: number
  busy: boolean
  onAdd: () => void
}

export function ProductCard({ product, quantityInBasket, busy, onAdd }: Props) {
  return (
    <article className="product-card">
      <Swatch name={product.name} />
      <div className="product-card__info">
        <h3>{product.name}</h3>
        <span className="code">{product.code}</span>
      </div>
      <p className="product-card__price">{formatPrice(product.price)}</p>
      <button
        type="button"
        className="button button--primary"
        disabled={busy || quantityInBasket >= MAX_QUANTITY}
        onClick={onAdd}
      >
        Add to basket
      </button>
      <p className="product-card__in-basket" aria-live="polite">
        {quantityInBasket > 0 ? `${quantityInBasket} in basket` : ''}
      </p>
    </article>
  )
}

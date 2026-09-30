import { useEffect, useState } from 'react'
import {
  type Cart,
  type Product,
  getCart,
  listProducts,
  removeFromCart,
  setCartQuantity,
} from './api.ts'
import { BasketPanel } from './components/BasketPanel.tsx'
import { ProductCard } from './components/ProductCard.tsx'
import './App.css'

function App() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([listProducts(), getCart()])
      .then(([products, cart]) => {
        if (!cancelled) {
          setProducts(products)
          setCart(cart)
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message))

    return () => {
      cancelled = true
    }
  }, [])

  /** Runs a cart update for one product, showing that product as busy meanwhile. */
  async function updateCart(productCode: string, update: () => Promise<Cart>) {
    setBusyCode(productCode)
    try {
      setCart(await update())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyCode(null)
    }
  }

  const quantityOf = (code: string) =>
    cart?.items.find((line) => line.product.code === code)?.quantity ?? 0

  return (
    <div className="page">
      <header className="page__header">
        <h1>Acme Widget Co</h1>
        <p>Sales system proof of concept</p>
      </header>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {products === null || cart === null ? (
        !error && <p className="loading">Loading…</p>
      ) : (
        <main className="layout">
          <section aria-labelledby="products-title">
            <h2 id="products-title">Products</h2>
            <div className="products">
              {products.map((product) => (
                <ProductCard
                  key={product.code}
                  product={product}
                  quantityInBasket={quantityOf(product.code)}
                  busy={busyCode === product.code}
                  onAdd={() =>
                    updateCart(product.code, () =>
                      setCartQuantity(product.code, quantityOf(product.code) + 1),
                    )
                  }
                />
              ))}
            </div>
          </section>

          <BasketPanel
            cart={cart}
            busyCode={busyCode}
            onSetQuantity={(code, quantity) =>
              updateCart(code, () => setCartQuantity(code, quantity))
            }
            onRemove={(code) => updateCart(code, () => removeFromCart(code))}
          />
        </main>
      )}
    </div>
  )
}

export default App

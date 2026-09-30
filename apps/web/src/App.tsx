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
    <div className="mx-auto max-w-[1080px] px-4 pt-6 pb-12 sm:px-6 sm:pt-10 sm:pb-16">
      <header className="mb-8">
        <h1 className="text-[1.75rem] font-bold tracking-tight">Acme Widget Co</h1>
        <p className="text-muted">Sales system proof of concept</p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl bg-danger-bg px-4 py-3 text-danger" role="alert">
          {error}
        </p>
      )}

      {products === null || cart === null ? (
        !error && <p className="text-muted">Loading…</p>
      ) : (
        <main className="grid items-start gap-8 min-[860px]:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-labelledby="products-title">
            <h2 id="products-title" className="mb-4 text-lg font-semibold">
              Products
            </h2>
            <div className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-4">
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

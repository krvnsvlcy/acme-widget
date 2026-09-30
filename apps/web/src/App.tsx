import { useEffect, useState } from 'react'
import {
  type Cart,
  type Product,
  getCart,
  listProducts,
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

  const setQuantity = (code: string, quantity: number) =>
    updateCart(code, () => setCartQuantity(code, quantity))

  return (
    // Full-viewport shell: the page never scrolls, each area scrolls on its own.
    // Wide screens: main on the left, cart on the right. Phones: main on top,
    // cart as a bottom panel.
    <div className="grid h-dvh grid-rows-[minmax(0,1fr)_auto] overflow-hidden md:grid-cols-[minmax(0,1fr)_380px] md:grid-rows-none">
      <main className="relative flex min-h-0 flex-col">
        {/* One scrolling document, with the header stuck to its top. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 md:px-12">
          {/* Poster-style corner marks. Bleeds to the column edges so content scrolls under it. */}
          <header className="sticky top-0 z-10 -mx-6 flex items-baseline justify-between bg-page px-6 pt-5 pb-3 md:-mx-12 md:px-12 md:pt-6">
            <h1 className="text-lg font-semibold tracking-tight">
              acme<span className="text-muted">.</span>
            </h1>
            <p className="text-[0.6875rem] text-muted">sales system — proof of concept</p>
          </header>

          <div className="max-w-4xl">
            {error && (
              <p className="mt-4 border border-danger px-4 py-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            {products === null ? (
              !error && <p className="mt-8 text-sm text-muted">loading…</p>
            ) : (
              <section aria-labelledby="products-title">
                <div className="pt-8 pb-8 md:pt-14 md:pb-12">
                  <h2
                    id="products-title"
                    className="text-6xl leading-[0.9] font-medium tracking-tighter md:text-8xl"
                  >
                    widgets
                  </h2>
                </div>
                <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                  {products.map((product, i) => (
                    <li key={product.code}>
                      <ProductCard
                        product={product}
                        number={i + 1}
                        quantityInBasket={quantityOf(product.code)}
                        busy={busyCode === product.code}
                        onSetQuantity={(quantity) => setQuantity(product.code, quantity)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        <p
          className="pointer-events-none absolute right-3 bottom-6 hidden text-[0.6875rem] text-faint [writing-mode:vertical-rl] md:block"
          aria-hidden="true"
        >
          acmewidget.co
        </p>
      </main>

      <BasketPanel cart={cart} className="max-h-[45dvh] md:max-h-none" />
    </div>
  )
}

export default App

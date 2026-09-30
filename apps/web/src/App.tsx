import { useEffect } from 'react'
import { useStore } from './libs/store.ts'
import { BasketPanel } from './components/BasketPanel.tsx'
import { ProductList } from './components/ProductList.tsx'

function ErrorAlert() {
  const error = useStore((s) => s.productsError ?? s.cartError)
  if (!error) return null

  return (
    <p className="mt-4 border border-danger px-4 py-3 text-sm text-danger" role="alert">
      {error}
    </p>
  )
}

function App() {
  const load = useStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

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
            <ErrorAlert />
            <ProductList />
          </div>
        </div>

        <p
          className="pointer-events-none absolute right-3 bottom-6 hidden text-[0.6875rem] text-faint [writing-mode:vertical-rl] md:block"
          aria-hidden="true"
        >
          acmewidget.co
        </p>
      </main>

      <BasketPanel className="max-h-[45dvh] md:max-h-none" />
    </div>
  )
}

export default App

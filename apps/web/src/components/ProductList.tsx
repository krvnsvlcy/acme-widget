import { useStore } from '../libs/store.ts'
import { ProductCard, ProductCardSkeleton } from './ProductCard.tsx'

function ProductsHeading() {
  return (
    <div className="pt-8 pb-8 md:pt-14 md:pb-12">
      <h2
        id="products-title"
        className="text-6xl leading-[0.9] font-medium tracking-tighter md:text-8xl"
      >
        widgets
      </h2>
    </div>
  )
}

/** How many placeholder cards to show while the catalogue loads. */
const SKELETON_COUNT = 4

/** The catalogue: a heading and a grid of product cards, with placeholders while loading. */
export function ProductList() {
  const products = useStore((s) => s.products)
  const status = useStore((s) => s.productsStatus)
  const error = useStore((s) => s.productsError)

  if (status === 'loading') {
    return (
      <section aria-labelledby="products-title" aria-busy="true">
        <ProductsHeading />
        <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    )
  }
  if (status === 'error') {
    return <p className="mt-8 text-sm text-muted">
      {error ?? 'An unknown error occurred while loading the catalogue.'}
    </p>
  }
  if (products === null) {
    return <p className="mt-8 text-sm text-muted">No products available.</p>
  }

  return (
    <section aria-labelledby="products-title">
      <ProductsHeading />
      <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {products.map((product, i) => (
          <li key={product.code}>
            <ProductCard product={product} number={i + 1} />
          </li>
        ))}
      </ul>
    </section>
  )
}

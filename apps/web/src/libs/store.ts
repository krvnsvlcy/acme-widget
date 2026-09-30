import { create } from 'zustand'
import {
  type Cart,
  type Product,
  MAX_QUANTITY,
  getCart,
  listProducts,
  setCartQuantity,
} from './api.ts'

/** How long a product's quantity must stay unchanged before it is sent to the server. */
const SAVE_DELAY_MS = 300

type State = {
  /** null until loaded. */
  products: Product[] | null
  productsStatus: 'loading' | 'success' | 'error'
  productsError: string | null
  /** null until loaded. Edits apply here immediately; the server's cart replaces it once saved. */
  cart: Cart | null
  /** 'saving' while local edits are waiting to be sent or are in flight. */
  cartStatus: 'loading' | 'success' | 'saving' | 'error'
  cartError: string | null
}

type Actions = {
  load: () => Promise<void>
  /** Sets a product's quantity locally at once and saves it to the server, debounced. 0 removes it. */
  setQuantity: (productCode: string, quantity: number) => void
}

const messageOf = (e: unknown) => (e as Error).message

export const useStore = create<State & Actions>()((set, get) => ({
  products: null,
  productsStatus: 'loading',
  productsError: null,
  cart: null,
  cartStatus: 'loading',
  cartError: null,

  load: async () => {
    await Promise.all([
      listProducts().then(
        (products) => set({ products, productsStatus: 'success', productsError: null }),
        (e) => set({ productsStatus: 'error', productsError: messageOf(e) }),
      ),
      getCart().then(
        (cart) => set({ cart, cartStatus: 'success', cartError: null }),
        (e) => set({ cartStatus: 'error', cartError: messageOf(e) }),
      ),
    ])
  },

  setQuantity: (productCode, quantity) => {
    const { cart, products } = get()
    const product = products?.find((p) => p.code === productCode)
    if (!cart || !product) return

    set({
      cart: withQuantity(cart, product, Math.min(Math.max(quantity, 0), MAX_QUANTITY)),
      cartStatus: 'saving',
    })
    scheduleSave(productCode)
  },
}))

/** Quantity of a product in the basket. A primitive, so only that product's card re-renders. */
export const selectQuantity = (code: string) => (s: State) =>
  s.cart?.items.find((line) => line.product.code === code)?.quantity ?? 0

/**
 * Optimistic edit: updates the product's line and shifts subtotal and total by
 * the line's change. Offers and delivery depend on server rules, so they keep
 * their old values until the server's cart arrives.
 */
function withQuantity(cart: Cart, product: Product, quantity: number): Cart {
  const others = cart.items.filter((line) => line.product.code !== product.code)
  const oldLine = cart.items.find((line) => line.product.code === product.code)
  const lineCents = quantity * product.price
  const delta = lineCents - (oldLine?.lineCents ?? 0)

  return {
    ...cart,
    items: quantity === 0 ? others : [...others, { product, quantity, lineCents }],
    subtotalCents: cart.subtotalCents + delta,
    totalCents: cart.totalCents + delta,
  }
}

// Saving. Each product has its own debounce timer. Sends go through one queue
// so the server sees them in order, and only the response that leaves nothing
// else pending is applied, so a stale cart never overwrites newer local edits.
const timers = new Map<string, ReturnType<typeof setTimeout>>()
let queue: Promise<void> = Promise.resolve()
let inFlight = 0
let failure: string | null = null
let latestServerCart: Cart | null = null

function scheduleSave(productCode: string) {
  clearTimeout(timers.get(productCode))
  timers.set(
    productCode,
    setTimeout(() => {
      timers.delete(productCode)
      send(productCode)
    }, SAVE_DELAY_MS),
  )
}

function send(productCode: string) {
  // Read the quantity at send time so it is the latest one the user chose.
  const quantity = selectQuantity(productCode)(useStore.getState())
  inFlight++

  queue = queue.then(async () => {
    try {
      latestServerCart = await setCartQuantity(productCode, quantity)
    } catch (e) {
      failure = messageOf(e)
    }
    inFlight--
    if (inFlight === 0 && timers.size === 0) await settle()
  })
}

/** Everything is saved: adopt the server's cart, or re-fetch it if a save failed. */
async function settle() {
  const error = failure
  failure = null

  if (error === null && latestServerCart) {
    useStore.setState({ cart: latestServerCart, cartStatus: 'success', cartError: null })
    return
  }

  try {
    useStore.setState({ cart: await getCart() })
  } catch {
    // Keep the local cart; the error below is still reported.
  }
  useStore.setState({ cartStatus: 'error', cartError: error ?? 'Could not save your basket' })
}

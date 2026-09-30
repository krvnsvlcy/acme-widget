// Thin client for the PHP API (apps/api). All amounts are in cents.

export type Product = {
  id: string
  code: string
  name: string
  price: number
}

export type CartLine = {
  product: Product
  quantity: number
  lineCents: number
}

export type Cart = {
  items: CartLine[]
  subtotalCents: number
  discountCents: number
  deliveryCents: number
  totalCents: number
}

/** Highest quantity the API accepts for a single product. */
export const MAX_QUANTITY = 99

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error ?? `Request failed (${response.status})`)
  }

  return body as T
}

export const listProducts = () => request<Product[]>('/api/products')

export const getCart = () => request<Cart>('/api/cart')

/** Sets the quantity of a product in the cart. 0 removes it. */
export const setCartQuantity = (productCode: string, quantity: number) =>
  request<Cart>(`/api/cart/items/${encodeURIComponent(productCode)}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })

export const removeFromCart = (productCode: string) =>
  request<Cart>(`/api/cart/items/${encodeURIComponent(productCode)}`, {
    method: 'DELETE',
  })

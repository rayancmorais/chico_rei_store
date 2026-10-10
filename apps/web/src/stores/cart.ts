import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Color, ProductSummary } from '@chico_rei_store/shared'
import { CART_STORAGE_KEY, loadCart, parseCart, saveCart } from './cart-storage'

export interface CartItem {
  key: string
  productId: string
  name: string
  image: string
  unitPriceCents: number
  color: Color
  size: string | null
  quantity: number
}

export interface CartVariant {
  color: Color
  size: string | null
}

// Faz parte da chave salva no localStorage: mudar o valor quebra carrinhos já salvos.
const NO_SIZE = 'unico'

export const MAX_QUANTITY = 10

function variantKey(productId: string, colorId: string, size: string | null) {
  return `${productId}::${colorId}::${size ?? NO_SIZE}`
}

function clampQuantity(quantity: number) {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)))
}

export const useCartStore = defineStore('cart', () => {
  // O limite pode ter mudado desde que o item foi salvo, então a quantidade passa pelo clamp de novo.
  const restore = (saved: CartItem[]) =>
    saved.map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))

  const items = ref<CartItem[]>(restore(loadCart()))
  const isOpen = ref(false)

  watch(items, saveCart, { deep: true })

  // Outra aba mexeu no carrinho: sem isso, a próxima gravação desta aba apagaria a mudança dela.
  window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) items.value = restore(parseCart(event.newValue))
  })

  const itemCount = computed(() => items.value.reduce((count, item) => count + item.quantity, 0))
  const subtotalCents = computed(() =>
    items.value.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
  )

  function findItem(key: string) {
    return items.value.find((item) => item.key === key)
  }

  function add(product: ProductSummary, variant: CartVariant, quantity = 1) {
    const key = variantKey(product.id, variant.color.id, variant.size)
    const existing = findItem(key)
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + quantity)
      return
    }
    items.value.push({
      key,
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPriceCents: product.priceCents,
      color: variant.color,
      size: variant.size,
      quantity: clampQuantity(quantity),
    })
  }

  function setQuantity(key: string, quantity: number) {
    const item = findItem(key)
    if (item) item.quantity = clampQuantity(quantity)
  }

  function remove(key: string) {
    items.value = items.value.filter((item) => item.key !== key)
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    items,
    isOpen,
    itemCount,
    subtotalCents,
    add,
    setQuantity,
    remove,
    open,
    close,
  }
})

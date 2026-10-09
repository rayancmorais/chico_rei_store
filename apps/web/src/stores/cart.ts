import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Color, ProductSummary } from '@chico_rei_store/shared'

export interface CartItem {
  key: string
  productId: string
  name: string
  unitPriceCents: number
  color: Color
  size: string | null
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const itemCount = computed(() => items.value.reduce((n, i) => n + i.quantity, 0))
  const subtotalCents = computed(() =>
    items.value.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
  )

  function add(
    product: ProductSummary,
    variant: { color: Color; size: string | null },
    quantity = 1,
  ) {
    const key = `${product.id}::${variant.color.id}::${variant.size ?? 'unico'}`
    const existing = items.value.find((i) => i.key === key)
    if (existing) {
      existing.quantity += quantity
      return
    }
    items.value.push({
      key,
      productId: product.id,
      name: product.name,
      unitPriceCents: product.priceCents,
      color: variant.color,
      size: variant.size,
      quantity,
    })
  }

  return { items, itemCount, subtotalCents, add }
})

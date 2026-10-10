import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { productSummary } from './factories'

const product = productSummary()
const preto = { id: 'preto', name: 'Preto', hex: '#000000' }
const branco = { id: 'branco', name: 'Branco', hex: '#ffffff' }

describe('cart store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('mesma variação soma quantidade', () => {
    const cart = useCartStore()
    cart.add(product, { color: preto, size: 'M' })
    cart.add(product, { color: preto, size: 'M' })
    expect(cart.items).toHaveLength(1)
    expect(cart.itemCount).toBe(2)
  })

  it('variação diferente vira item separado', () => {
    const cart = useCartStore()
    cart.add(product, { color: preto, size: 'M' })
    cart.add(product, { color: branco, size: 'M' })
    expect(cart.items).toHaveLength(2)
    expect(cart.subtotalCents).toBe(15980)
  })
})

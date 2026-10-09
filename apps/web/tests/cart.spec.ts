import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '@/stores/cart'

const product = {
  id: 'cam-1',
  name: 'Camiseta',
  type: 'camiseta',
  priceCents: 7990,
  image: 'https://x.test/a.jpg',
  colors: [],
}
const preto = { id: 'preto', name: 'Preto', hex: '#111' }
const branco = { id: 'branco', name: 'Branco', hex: '#fff' }

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

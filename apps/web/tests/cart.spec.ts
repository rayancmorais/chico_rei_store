import { createPinia, setActivePinia } from 'pinia'
import { MAX_QUANTITY, useCartStore } from '@/stores/cart'
import { productSummary } from './factories'

const camiseta = productSummary({ id: 'cam-1', priceCents: 7990 })
const caneca = productSummary({ id: 'can-1', priceCents: 4990 })
const preto = { id: 'preto', name: 'Preto', hex: '#000000' }
const branco = { id: 'branco', name: 'Branco', hex: '#ffffff' }

describe('cart store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('mesma variação soma quantidade em vez de duplicar o item', () => {
    const cart = useCartStore()
    cart.add(camiseta, { color: preto, size: 'M' })
    cart.add(camiseta, { color: preto, size: 'M' })
    expect(cart.items).toHaveLength(1)
    expect(cart.itemCount).toBe(2)
  })

  it('cor ou tamanho diferente vira item separado', () => {
    const cart = useCartStore()
    cart.add(camiseta, { color: preto, size: 'M' })
    cart.add(camiseta, { color: branco, size: 'M' })
    cart.add(camiseta, { color: preto, size: 'G' })
    expect(cart.items).toHaveLength(3)
  })

  it('produto sem tamanho também é identificado pela cor', () => {
    const cart = useCartStore()
    cart.add(caneca, { color: preto, size: null })
    cart.add(caneca, { color: preto, size: null })
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.quantity).toBe(2)
  })

  it('guarda o que o drawer precisa mostrar', () => {
    const cart = useCartStore()
    cart.add(camiseta, { color: preto, size: 'M' })
    expect(cart.items[0]).toMatchObject({
      productId: 'cam-1',
      name: camiseta.name,
      image: camiseta.image,
      unitPriceCents: 7990,
      color: preto,
      size: 'M',
    })
  })

  it('subtotal soma preço vezes quantidade de cada item', () => {
    const cart = useCartStore()
    cart.add(camiseta, { color: preto, size: 'M' }, 2)
    cart.add(caneca, { color: branco, size: null })
    expect(cart.subtotalCents).toBe(7990 * 2 + 4990)
  })

  it('altera a quantidade e mantém entre 1 e o máximo', () => {
    const cart = useCartStore()
    cart.add(camiseta, { color: preto, size: 'M' })
    const key = cart.items[0]!.key

    cart.setQuantity(key, 3)
    expect(cart.items[0]?.quantity).toBe(3)

    cart.setQuantity(key, 0)
    expect(cart.items[0]?.quantity).toBe(1)

    cart.setQuantity(key, 99)
    expect(cart.items[0]?.quantity).toBe(MAX_QUANTITY)

    cart.add(camiseta, { color: preto, size: 'M' })
    expect(cart.items[0]?.quantity).toBe(MAX_QUANTITY)
  })

  it('remove só o item escolhido', () => {
    const cart = useCartStore()
    cart.add(camiseta, { color: preto, size: 'M' })
    cart.add(camiseta, { color: branco, size: 'M' })

    cart.remove(cart.items[0]!.key)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.color.id).toBe('branco')
  })

  it('abre e fecha o drawer', () => {
    const cart = useCartStore()
    expect(cart.isOpen).toBe(false)
    cart.open()
    expect(cart.isOpen).toBe(true)
    cart.close()
    expect(cart.isOpen).toBe(false)
  })
})

import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { MAX_QUANTITY, useCartStore } from '@/stores/cart'
import { CART_STORAGE_KEY } from '@/stores/cart-storage'
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

  describe('persistência', () => {
    // Uma pinia nova simula recarregar a página: a store nasce do zero e lê o localStorage.
    const reload = () => {
      setActivePinia(createPinia())
      return useCartStore()
    }

    it('o carrinho sobrevive ao recarregamento, mas o drawer volta fechado', async () => {
      const cart = useCartStore()
      cart.add(camiseta, { color: preto, size: 'M' }, 2)
      cart.open()
      await nextTick()

      const reloaded = reload()
      expect(reloaded.items).toHaveLength(1)
      expect(reloaded.itemCount).toBe(2)
      expect(reloaded.isOpen).toBe(false)
    })

    it('salva também mudança de quantidade e remoção', async () => {
      const cart = useCartStore()
      cart.add(camiseta, { color: preto, size: 'M' })
      cart.add(caneca, { color: branco, size: null })
      await nextTick()

      cart.setQuantity(cart.items[0]!.key, 5)
      cart.remove(cart.items[1]!.key)
      await nextTick()

      const reloaded = reload()
      expect(reloaded.items.map((item) => [item.productId, item.quantity])).toEqual([['cam-1', 5]])
    })

    it('quantidade salva acima do máximo volta para o limite', () => {
      const cart = useCartStore()
      cart.add(camiseta, { color: preto, size: 'M' })
      const saved = [{ ...cart.items[0], quantity: 99 }]
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(saved))

      expect(reload().items[0]?.quantity).toBe(MAX_QUANTITY)
    })

    it('acompanha o que outra aba muda no carrinho', () => {
      const cart = useCartStore()
      const fromOtherTab = {
        key: 'can-1::branco::unico',
        productId: 'can-1',
        name: caneca.name,
        image: caneca.image,
        unitPriceCents: caneca.priceCents,
        color: branco,
        size: null,
        quantity: 3,
      }
      const newValue = JSON.stringify([fromOtherTab])

      window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY, newValue }))

      expect(cart.items).toEqual([fromOtherTab])
    })
  })
})

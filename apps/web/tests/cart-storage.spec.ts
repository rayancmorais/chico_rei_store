import { CART_STORAGE_KEY, loadCart, parseCart, saveCart } from '@/stores/cart-storage'
import type { CartItem } from '@/stores/cart'

const item: CartItem = {
  key: 'cam-1::preto::M',
  productId: 'cam-1',
  name: 'Camiseta',
  image: 'https://umapenca.imgix.net/1/a.png',
  unitPriceCents: 7990,
  color: { id: 'preto', name: 'Preto', hex: '#000000' },
  size: 'M',
  quantity: 2,
}

describe('cart storage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lê de volta o que salvou', () => {
    saveCart([item])
    expect(loadCart()).toEqual([item])
  })

  it('sem nada salvo, ou com JSON quebrado, começa vazio', () => {
    expect(parseCart(null)).toEqual([])
    expect(parseCart('{quebrado')).toEqual([])
    expect(parseCart('{"items": []}')).toEqual([])
  })

  it('descarta só os itens inválidos', () => {
    const raw = JSON.stringify([
      item,
      { ...item, key: 'x', quantity: 0 },
      { ...item, key: 'y', color: 'preto' },
      { ...item, key: 'z', size: 42 },
      'lixo',
    ])
    expect(parseCart(raw)).toEqual([item])
  })

  it('não quebra quando o navegador bloqueia o localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('cheio', 'QuotaExceededError')
    })
    expect(loadCart()).toEqual([])
    expect(() => saveCart([item])).not.toThrow()
  })

  it('usa uma chave com versão', () => {
    expect(CART_STORAGE_KEY).toMatch(/:v1$/)
  })
})

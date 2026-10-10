import { createLocalVue, mount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import CartDrawer from '@/components/CartDrawer.vue'
import { useCartStore } from '@/stores/cart'
import { productSummary } from './factories'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)

const preto = { id: 'preto', name: 'Preto', hex: '#000000' }
const branco = { id: 'branco', name: 'Branco', hex: '#ffffff' }

async function mountDrawer(fill?: (cart: ReturnType<typeof useCartStore>) => void) {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
  const cart = useCartStore(pinia)
  fill?.(cart)
  // attachTo: foco só funciona em elemento que está no documento.
  const wrapper = mount(CartDrawer, { localVue, pinia, attachTo: document.body })
  cart.open()
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  return { wrapper, cart }
}

const camiseta = productSummary({ id: 'cam-1', name: 'Camiseta', priceCents: 7990 })
const caneca = productSummary({ id: 'can-1', name: 'Caneca', priceCents: 4990 })

describe('CartDrawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('não renderiza nada enquanto está fechado', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
    const wrapper = mount(CartDrawer, { localVue, pinia })
    expect(wrapper.find('[data-test="cart-drawer"]').exists()).toBe(false)
  })

  it('mostra o estado vazio quando não há itens', async () => {
    const { wrapper } = await mountDrawer()
    expect(wrapper.find('[data-test="cart-empty"]').text()).toContain('Seu carrinho está vazio')
  })

  it('lista cada variação como um item, com cor, tamanho e subtotal', async () => {
    const { wrapper } = await mountDrawer((cart) => {
      cart.add(camiseta, { color: preto, size: 'M' })
      cart.add(camiseta, { color: branco, size: 'G' })
      cart.add(caneca, { color: branco, size: null })
    })

    const variants = wrapper.findAll('[data-test="item-variant"]').wrappers.map((w) => w.text())
    expect(variants).toEqual(['Preto · Tamanho M', 'Branco · Tamanho G', 'Branco'])
    expect(wrapper.find('[data-test="cart-subtotal"]').text()).toMatch(/R\$\s209,70/)
  })

  it('aumentar a quantidade atualiza o total do item e o subtotal na hora', async () => {
    const { wrapper } = await mountDrawer((cart) => cart.add(camiseta, { color: preto, size: 'M' }))
    expect(wrapper.find('[data-test="decrease"]').attributes('disabled')).toBeDefined()

    await wrapper.find('[data-test="increase"]').trigger('click')

    expect(wrapper.find('[data-test="quantity"]').text()).toBe('2')
    expect(wrapper.find('[data-test="item-total"]').text()).toMatch(/R\$\s159,80/)
    expect(wrapper.find('[data-test="cart-subtotal"]').text()).toMatch(/R\$\s159,80/)
    expect(wrapper.find('[data-test="decrease"]').attributes('disabled')).toBeUndefined()
  })

  it('remove o item e devolve o foco para o drawer', async () => {
    const { wrapper, cart } = await mountDrawer((store) => {
      store.add(camiseta, { color: preto, size: 'M' })
      store.add(caneca, { color: branco, size: null })
    })

    // Foca o botão como um clique real faria; é esse foco que se perde quando o item some.
    const removeButton = wrapper.find('[data-test="remove-item"]')
    const removeElement = removeButton.element as HTMLElement
    removeElement.focus()
    await removeButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(cart.items.map((item) => item.name)).toEqual(['Caneca'])
    expect(document.activeElement).toBe(wrapper.find('[data-test="close-cart"]').element)
  })

  it('ao abrir, coloca o foco no botão de fechar', async () => {
    const { wrapper } = await mountDrawer()
    expect(document.activeElement).toBe(wrapper.find('[data-test="close-cart"]').element)
  })

  it('fecha com Esc, com o botão e clicando fora', async () => {
    const { wrapper, cart } = await mountDrawer()

    await wrapper.find('[data-test="cart-drawer"]').trigger('keydown', { key: 'Escape' })
    expect(cart.isOpen).toBe(false)

    cart.open()
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-test="close-cart"]').trigger('click')
    expect(cart.isOpen).toBe(false)

    cart.open()
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-test="cart-backdrop"]').trigger('click')
    expect(cart.isOpen).toBe(false)
  })
})

import { createLocalVue, mount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import VueRouter from 'vue-router'
import type { CreateElement } from 'vue'
import App from '@/App.vue'
import { useCartStore } from '@/stores/cart'
import { productSummary } from './factories'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.use(VueRouter)

const page = { render: (h: CreateElement) => h('div') }

describe('App', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('o botão do cabeçalho mostra a quantidade e abre o carrinho', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
    const cart = useCartStore(pinia)
    cart.add(
      productSummary(),
      { color: { id: 'preto', name: 'Preto', hex: '#000000' }, size: 'M' },
      2,
    )

    const router = new VueRouter({
      mode: 'abstract',
      routes: [{ path: '/', name: 'catalog', component: page }],
    })
    await router.push('/')
    const wrapper = mount(App, { localVue, pinia, router, attachTo: document.body })

    const button = wrapper.find('[data-test="open-cart"]')
    expect(button.find('[data-test="cart-count"]').text()).toBe('2')
    expect(button.attributes('aria-label')).toBe('Abrir carrinho, 2 itens')

    // O símbolo é decorativo: o nome acessível do logo vem do link.
    const logo = wrapper.find('[data-test="brand-logo"]')
    expect(logo.attributes('aria-label')).toBe('Penca Store, página inicial')
    expect(logo.attributes('href')).toBe('/')

    await button.trigger('click')
    expect(wrapper.find('[data-test="cart-drawer"]').exists()).toBe(true)
  })
})

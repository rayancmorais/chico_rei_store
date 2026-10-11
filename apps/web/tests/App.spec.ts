import { createLocalVue, mount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import VueRouter from 'vue-router'
import type { CreateElement } from 'vue'
import { delay, http, HttpResponse } from 'msw'
import App from '@/App.vue'
import CatalogView from '@/views/CatalogView.vue'
import { useCartStore } from '@/stores/cart'
import { server } from './setup'
import { listResponse, productSummary } from './factories'

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

describe('menu do topo leva até a listagem', () => {
  // Espera a resposta do MSW e o re-render do Vue.
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0))
  let scrollIntoView: ReturnType<typeof vi.fn>
  let reduceMotion = false

  beforeEach(() => {
    // O jsdom não implementa rolagem nem media queries.
    scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    reduceMotion = false
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduceMotion, media: query }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  async function mountApp(url = '/') {
    const router = new VueRouter({
      mode: 'abstract',
      routes: [
        { path: '/', name: 'catalog', component: CatalogView },
        { path: '/produto/:id', name: 'product', component: page },
      ],
    })
    await router.push(url)
    const wrapper = mount(App, {
      localVue,
      router,
      pinia: createTestingPinia({ createSpy: vi.fn }),
      attachTo: document.body,
    })
    await settle()
    return { wrapper, router }
  }

  const navLink = (wrapper: Awaited<ReturnType<typeof mountApp>>['wrapper'], label: string) =>
    wrapper
      .findAll('nav[aria-label="Categorias"] a')
      .filter((link) => link.text() === label)
      .at(0)
  const focusedId = () => document.activeElement?.id

  it('clicar num item do menu aplica o filtro, rola até a listagem e foca o título', async () => {
    const { wrapper, router } = await mountApp()

    await navLink(wrapper, 'Moletons').trigger('click')
    await settle()

    expect(router.currentRoute.query.type).toBe('moletom')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(focusedId()).toBe('results-title')
    wrapper.destroy()
  })

  it('com movimento reduzido, pula direto para a listagem, sem animação', async () => {
    reduceMotion = true
    const { wrapper } = await mountApp()

    await navLink(wrapper, 'Moletons').trigger('click')
    await settle()

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    wrapper.destroy()
  })

  it('o item do menu que já está ativo também leva até a listagem', async () => {
    const { wrapper } = await mountApp('/?type=moletom')

    await navLink(wrapper, 'Moletons').trigger('click')
    await settle()

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(focusedId()).toBe('results-title')
    wrapper.destroy()
  })

  it('o chip da barra de filtros não rola a página nem move o foco', async () => {
    const { wrapper, router } = await mountApp()
    const chip = wrapper.find<HTMLButtonElement>('[data-test="type-camiseta"]')

    chip.element.focus()
    await chip.trigger('click')
    await settle()

    expect(router.currentRoute.query.type).toBe('camiseta')
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(chip.element)
    wrapper.destroy()
  })

  it('o botão do hero tem o mesmo comportamento do menu', async () => {
    const { wrapper } = await mountApp()

    await wrapper.find('[data-test="hero-shop"]').trigger('click')
    await settle()

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(focusedId()).toBe('results-title')
    wrapper.destroy()
  })

  it('Cmd/Ctrl+clique, que abre outra aba, não rola esta', async () => {
    const { wrapper } = await mountApp('/?type=moletom')
    const link = navLink(wrapper, 'Moletons')
    // Sem isto, o jsdom tentaria abrir o link de verdade (e avisa que não sabe navegar).
    link.element.addEventListener('click', (event) => event.preventDefault())

    await link.trigger('click', { metaKey: true })
    await settle()

    expect(scrollIntoView).not.toHaveBeenCalled()
    wrapper.destroy()
  })

  it('o pedido não sobra se a pessoa sai do catálogo antes da primeira carga terminar', async () => {
    const { wrapper, router } = await mountApp()
    server.use(
      http.get('*/api/products', async () => {
        await delay(50)
        return HttpResponse.json(listResponse([productSummary()]))
      }),
    )

    await navLink(wrapper, 'Moletons').trigger('click')
    await router.push('/produto/cam-1')
    await settle()

    await router.push('/')
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.find('[data-test="product-grid"]').exists()).toBe(true)
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(focusedId()).not.toBe('results-title')
    wrapper.destroy()
  })
})

import { createLocalVue, mount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import VueRouter from 'vue-router'
import type { CreateElement } from 'vue'
import { http, HttpResponse } from 'msw'
import ProductView from '@/views/ProductView.vue'
import { useCartStore } from '@/stores/cart'
import { server } from './setup'
import { listResponse, product, productSummary } from './factories'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.use(VueRouter)

// Espera a resposta do MSW e o re-render do Vue.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

function useProduct(overrides: Parameters<typeof product>[0]) {
  server.use(
    http.get('*/api/products/:id', ({ params }) =>
      HttpResponse.json(product({ id: String(params.id), ...overrides })),
    ),
  )
}

async function mountView(id = 'cam-1') {
  const router = new VueRouter({
    mode: 'abstract',
    routes: [
      { path: '/', name: 'catalog', component: { render: (h: CreateElement) => h('div') } },
      { path: '/produto/:id', name: 'product', component: ProductView, props: true },
    ],
  })
  await router.push(`/produto/${id}`)
  // attachTo: o teste de foco precisa do componente dentro do document.
  // Monta pelo <router-view>, como no app: é o router que passa o `id` e o troca na navegação.
  const wrapper = mount(
    { render: (h: CreateElement) => h('router-view') },
    {
      localVue,
      router,
      pinia: createTestingPinia({ createSpy: vi.fn, stubActions: false }),
      attachTo: document.body,
    },
  )
  await settle()
  return { wrapper, router, cart: useCartStore() }
}

afterEach(() => {
  document.body.innerHTML = ''
})

const addButton = (wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']) =>
  wrapper.find('[data-test="add-to-cart"]')

describe('ProductView', () => {
  it('mostra o produto com nome, preço e descrição', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.find('h1').text()).toBe('Camiseta Teste')
    expect(wrapper.find('[data-test="price"]').text()).toMatch(/R\$\s79,90/)
    expect(wrapper.text()).toContain('Camiseta de algodão.')
  })

  it('bloqueia o botão até escolher cor e tamanho, dizendo o que falta', async () => {
    const { wrapper } = await mountView()
    expect(addButton(wrapper).attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('[data-test="missing-choice"]').text()).toBe('Escolha a cor e o tamanho')

    await wrapper.find('[data-test="color-option-preto"]').trigger('change')
    expect(addButton(wrapper).attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('[data-test="missing-choice"]').text()).toBe('Escolha o tamanho')

    await wrapper.find('[data-test="size-option-M"]').trigger('change')
    expect(addButton(wrapper).attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.find('[data-test="missing-choice"]').exists()).toBe(false)
  })

  it('clicar no botão bloqueado destaca o que falta e leva o foco até lá', async () => {
    const { wrapper, cart } = await mountView()
    await wrapper.find('[data-test="color-option-preto"]').trigger('change')
    expect(wrapper.find('[data-test="pending-tag"]').exists()).toBe(false)

    await addButton(wrapper).trigger('click')

    expect(cart.items).toHaveLength(0)
    const sizeGroup = wrapper.find('[data-test="size-selector"]')
    expect(sizeGroup.find('[data-test="pending-tag"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="color-selector"] [data-test="pending-tag"]').exists()).toBe(
      false,
    )
    expect(document.activeElement).toBe(sizeGroup.find('[data-test="size-option-P"]').element)

    await wrapper.find('[data-test="size-option-M"]').trigger('change')
    expect(wrapper.find('[data-test="pending-tag"]').exists()).toBe(false)
  })

  it('adiciona ao carrinho com a variação escolhida e confirma', async () => {
    const { wrapper, cart } = await mountView()
    await wrapper.find('[data-test="color-option-branco"]').trigger('change')
    await wrapper.find('[data-test="size-option-G"]').trigger('change')
    await addButton(wrapper).trigger('click')

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ productId: 'cam-1', size: 'G', quantity: 1 })
    expect(cart.items[0]?.color.id).toBe('branco')
    expect(wrapper.find('[data-test="added"]').attributes('role')).toBe('status')
    expect(addButton(wrapper).text()).toContain('Adicionado')
    expect(cart.isOpen).toBe(true)

    // O mesmo botão vira atalho para o carrinho, sem adicionar de novo.
    cart.close()
    await addButton(wrapper).trigger('click')
    expect(cart.isOpen).toBe(true)
    expect(cart.items[0]?.quantity).toBe(1)
  })

  it('produto sem tamanho não mostra o seletor e só exige a cor', async () => {
    useProduct({ sizes: [] })
    const { wrapper, cart } = await mountView()
    expect(wrapper.find('[data-test="size-selector"]').exists()).toBe(false)

    await wrapper.find('[data-test="color-option-preto"]').trigger('change')
    await addButton(wrapper).trigger('click')

    expect(cart.items[0]?.size).toBeNull()
  })

  it('já seleciona a opção quando só existe uma', async () => {
    useProduct({ colors: [{ id: 'preto', name: 'Preto', hex: '#000000' }], sizes: ['U'] })
    const { wrapper } = await mountView()
    expect(addButton(wrapper).attributes('aria-disabled')).toBeUndefined()
  })

  it('galeria troca entre a peça inteira e os recortes', async () => {
    const { wrapper } = await mountView()
    const image = () => wrapper.find('[data-test="gallery-image"]')
    expect(image().attributes('alt')).toBe('Camiseta Teste')

    await wrapper.find('[data-test="gallery-thumb-1"]').trigger('click')
    expect(image().attributes('alt')).toBe('Camiseta Teste: detalhe da estampa')
    expect(image().attributes('src')).toContain('fp-z=2.2')
    expect(wrapper.find('[data-test="gallery-thumb-1"]').attributes('aria-pressed')).toBe('true')

    await wrapper.find('[data-test="gallery-prev"]').trigger('click')
    await wrapper.find('[data-test="gallery-prev"]').trigger('click')
    expect(wrapper.find('[data-test="gallery-position"]').text()).toContain('3 / 3')
  })

  it('mostra outros produtos do mesmo tipo, sem repetir o atual', async () => {
    server.use(
      http.get('*/api/products', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('type')).toBe('camiseta')
        return HttpResponse.json(
          listResponse([
            productSummary({ id: 'cam-1' }),
            productSummary({ id: 'cam-2', name: 'Outra' }),
          ]),
        )
      }),
    )
    const { wrapper } = await mountView()
    await settle()
    const cards = wrapper.findAll('[data-test="related"] [data-test="product-card"]')
    expect(cards).toHaveLength(1)
    expect(cards.at(0).text()).toContain('Outra')
  })

  it('mostra "não encontrado" quando a API responde 404', async () => {
    server.use(
      http.get('*/api/products/:id', () =>
        HttpResponse.json(
          { error: { code: 'PRODUCT_NOT_FOUND', message: 'Produto x não encontrado' } },
          { status: 404 },
        ),
      ),
    )
    const { wrapper } = await mountView('x')
    expect(wrapper.find('[data-test="not-found"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
  })

  it('mostra o erro e recupera ao tentar de novo', async () => {
    server.use(
      http.get('*/api/products/:id', () => HttpResponse.json({}, { status: 500 }), { once: true }),
    )
    const { wrapper } = await mountView()
    expect(wrapper.find('[data-test="error"]').attributes('role')).toBe('alert')

    await wrapper.find('[data-test="retry"]').trigger('click')
    await settle()
    expect(wrapper.find('[data-test="product"]').exists()).toBe(true)
  })

  it('ao navegar para outro produto, carrega o novo e limpa a escolha', async () => {
    const { wrapper, router } = await mountView('cam-1')
    await wrapper.find('[data-test="color-option-preto"]').trigger('change')

    useProduct({ name: 'Outra Camiseta' })
    await router.push('/produto/cam-2')
    await settle()

    expect(wrapper.find('h1').text()).toBe('Outra Camiseta')
    expect(wrapper.find('[data-test="missing-choice"]').text()).toBe('Escolha a cor e o tamanho')
  })
})

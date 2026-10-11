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

// O layout muda no DOM a partir do tablet (768 px). O jsdom não tem `matchMedia`, então sem esta
// opção a página monta como no celular.
function stubScreen({ twoColumns }: { twoColumns: boolean }) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: twoColumns && query === '(min-width: 768px)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

async function mountView(id = 'cam-1', { twoColumns = false } = {}) {
  stubScreen({ twoColumns })
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

beforeEach(() => {
  // O jsdom não implementa rolagem.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const addButton = (wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']) =>
  wrapper.find('[data-test="add-to-cart"]')

describe('ProductView', () => {
  it('mostra o produto com nome, preço e descrição', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.find('h1').text()).toBe('Camiseta Teste')
    expect(wrapper.find('[data-test="price"]').text()).toMatch(/R\$\s*79,90/)
    expect(wrapper.text()).toContain('Camiseta de algodão.')
  })

  it('bloqueia o botão até escolher cor e tamanho, e o card diz o que falta', async () => {
    const { wrapper } = await mountView('cam-1', { twoColumns: true })
    const choice = () => wrapper.find('[data-test="choice-line"]').text()
    expect(addButton(wrapper).attributes('aria-disabled')).toBe('true')
    expect(choice()).toBe('Falta cor e tamanho')

    await wrapper.find('[data-test="color-option-preto"]').trigger('change')
    expect(addButton(wrapper).attributes('aria-disabled')).toBe('true')
    expect(choice()).toBe('Falta o tamanho')

    await wrapper.find('[data-test="size-option-M"]').trigger('change')
    expect(addButton(wrapper).attributes('aria-disabled')).toBeUndefined()
    expect(choice()).toBe('Preto · Tam. M')
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
    // A rolagem é da view, e não do foco, para descontar o cabeçalho fixo.
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'nearest' }),
    )
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(sizeGroup.element)

    await wrapper.find('[data-test="size-option-M"]').trigger('change')
    expect(wrapper.find('[data-test="pending-tag"]').exists()).toBe(false)
  })

  it('adiciona ao carrinho com a variação escolhida e confirma', async () => {
    const { wrapper, cart } = await mountView('cam-1', { twoColumns: true })
    await wrapper.find('[data-test="color-option-branco"]').trigger('change')
    await wrapper.find('[data-test="size-option-G"]').trigger('change')
    await addButton(wrapper).trigger('click')

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ productId: 'cam-1', size: 'G', quantity: 1 })
    expect(cart.items[0]?.color.id).toBe('branco')
    expect(wrapper.find('[data-test="added"]').attributes('role')).toBe('status')
    expect(addButton(wrapper).text()).toBe('Ver carrinho')
    expect(cart.isOpen).toBe(false)

    // O mesmo botão vira atalho para o carrinho, sem adicionar de novo.
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

  it('com só a cor padrão e sem tamanho, a cor já vem marcada e o botão fica liberado', async () => {
    useProduct({
      colors: [{ id: 'cor-unica', name: 'Cor única', hex: '#E6DCCB' }],
      sizes: [],
      enriched: { colors: true, sizes: true, description: true },
    })
    const { wrapper } = await mountView()

    expect(wrapper.find('[data-test="color-name"]').text()).toBe('Cor única')
    expect(addButton(wrapper).attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.find('[data-test="enriched-note"]').exists()).toBe(true)
  })

  it('mostra só a foto real do produto, sem recortes nem navegação de galeria', async () => {
    const { wrapper } = await mountView()
    const photos = wrapper.find('[data-test="product"]').findAll('[data-test="product-photo"]')

    expect(photos).toHaveLength(1)
    const photo = photos.at(0)
    expect(photo.attributes('alt')).toBe('Camiseta Teste')
    expect(photo.attributes('width')).toBe('800')
    expect(photo.attributes('height')).toBe('1000')
    expect(photo.attributes('srcset')).toMatch(/w=600.* 600w, .*w=1200.* 1200w/)
    expect(photo.attributes('srcset')).not.toContain('fp-')
    expect(wrapper.find('button[aria-label="Próxima imagem"]').exists()).toBe(false)
    expect(wrapper.find('[data-test^="gallery"]').exists()).toBe(false)
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
    expect(addButton(wrapper).attributes('aria-disabled')).toBe('true')
  })
})

describe('ProductView no celular', () => {
  afterEach(() => vi.useRealTimers())

  it('o card de compra mostra miniatura, preço, o que falta e o botão "Adicionar"', async () => {
    const { wrapper } = await mountView()
    const box = wrapper.find('[data-test="buy-box"]')
    expect(box.find('img').exists()).toBe(true)
    expect(box.find('[data-test="buy-summary"]').text()).toMatch(/R\$\s79,90/)
    expect(box.find('[data-test="choice-line"]').text()).toBe('Falta cor e tamanho')
    expect(addButton(wrapper).text()).toBe('Adicionar ao carrinho')
    expect(wrapper.find('[data-test="missing-choice"]').exists()).toBe(false)

    await wrapper.find('[data-test="size-option-G"]').trigger('change')
    expect(box.find('[data-test="choice-line"]').text()).toBe('Falta a cor')

    await wrapper.find('[data-test="color-option-branco"]').trigger('change')
    expect(box.find('[data-test="choice-line"]').text()).toBe('Branco · Tam. G')
  })

  it('ao adicionar, o card mostra o que entrou por 3 s; depois volta a "Adicionar"', async () => {
    const { wrapper, cart } = await mountView()
    await wrapper.find('[data-test="color-option-branco"]').trigger('change')
    await wrapper.find('[data-test="size-option-G"]').trigger('change')
    vi.useFakeTimers()

    const button = addButton(wrapper).element as HTMLElement
    button.focus()
    await addButton(wrapper).trigger('click')

    const notice = wrapper.find('[data-test="added-notice"]')
    expect(notice.text()).toContain('Adicionado ao carrinho')
    expect(notice.text()).toContain('Camiseta Teste')
    expect(notice.text()).toContain('Branco · Tam. G')
    expect(addButton(wrapper).text()).toBe('Ver carrinho')
    expect(cart.isOpen).toBe(false)
    expect(document.activeElement).toBe(button)

    await addButton(wrapper).trigger('click')
    expect(cart.isOpen).toBe(true)

    await vi.advanceTimersByTimeAsync(3000)
    expect(wrapper.find('[data-test="added-notice"]').exists()).toBe(false)
    expect(addButton(wrapper).text()).toBe('Adicionar ao carrinho')
    expect(cart.items[0]?.quantity).toBe(1)
  })

  it('num produto sem tamanho, o aviso mostra só a cor', async () => {
    useProduct({ sizes: [] })
    const { wrapper } = await mountView()
    await wrapper.find('[data-test="color-option-preto"]').trigger('change')
    await addButton(wrapper).trigger('click')

    const detail = wrapper.find('[data-test="added-notice"]').text()
    expect(detail).toContain('Preto')
    expect(detail).not.toContain('Tam.')
  })

  it('no desktop, o mesmo card de compra e o mesmo aviso de 3 s', async () => {
    const { wrapper } = await mountView('cam-1', { twoColumns: true })
    await wrapper.find('[data-test="color-option-branco"]').trigger('change')
    await wrapper.find('[data-test="size-option-G"]').trigger('change')
    expect(wrapper.find('[data-test="choice-line"]').text()).toBe('Branco · Tam. G')
    vi.useFakeTimers()

    await addButton(wrapper).trigger('click')
    expect(wrapper.find('[data-test="added-notice"]').text()).toContain('Branco · Tam. G')

    await vi.advanceTimersByTimeAsync(3000)
    expect(wrapper.find('[data-test="added-notice"]').exists()).toBe(false)
    expect(addButton(wrapper).text()).toBe('Adicionar ao carrinho')
  })

  it('"Sobre a peça" fica recolhido, e aberto mostra a descrição e o aviso de dados gerados', async () => {
    const mobile = await mountView()
    const about = mobile.wrapper.find('[data-test="about"]')
    expect(about.element.tagName).toBe('DETAILS')
    expect((about.element as HTMLDetailsElement).open).toBe(false)
    expect(about.find('summary').text()).toContain('Sobre a peça')
    expect(about.find('[data-test="enriched-note"]').exists()).toBe(true)
    mobile.wrapper.destroy()

    const desktop = await mountView('cam-1', { twoColumns: true })
    expect(desktop.wrapper.find('[data-test="about"]').element.tagName).toBe('SECTION')
  })

  it('o "Nº" aparece uma vez só, na linha de informações', async () => {
    const mobile = await mountView()
    const product = mobile.wrapper.find('[data-test="product"]')
    expect(product.text().match(/Nº/g)).toHaveLength(1)
    expect(product.find('[data-test="product-meta"]').text()).toMatch(/Camiseta\s*Nº cam-1/)
    mobile.wrapper.destroy()

    const desktop = await mountView('cam-1', { twoColumns: true })
    expect(desktop.wrapper.find('[data-test="product-meta"]').exists()).toBe(false)
    expect(desktop.wrapper.find('[data-test="product"]').text()).toContain('Nº cam-1')
  })

  it('troca o caminho de navegação por um botão Voltar sobre a foto', async () => {
    const mobile = await mountView()
    expect(mobile.wrapper.find('[data-test="back-to-store"]').attributes('aria-label')).toBe(
      'Voltar para a loja',
    )
    expect(mobile.wrapper.find('nav[aria-label="Navegação estrutural"]').exists()).toBe(false)
    mobile.wrapper.destroy()

    const desktop = await mountView('cam-1', { twoColumns: true })
    expect(desktop.wrapper.find('[data-test="back-to-store"]').exists()).toBe(false)
    expect(desktop.wrapper.find('nav[aria-label="Navegação estrutural"]').exists()).toBe(true)
  })
})

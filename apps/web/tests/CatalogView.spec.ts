import { createLocalVue, mount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import VueRouter from 'vue-router'
import type { CreateElement } from 'vue'
import { delay, http, HttpResponse } from 'msw'
import CatalogView from '@/views/CatalogView.vue'
import { server } from './setup'
import { filtersResponse, listResponse, productSummary } from './factories'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.use(VueRouter)

// Espera a resposta do MSW e o re-render do Vue.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

async function mountView(url = '/') {
  // Modo abstract: o router guarda a URL em memória, sem depender do histórico do jsdom.
  const router = new VueRouter({
    mode: 'abstract',
    routes: [
      { path: '/', name: 'catalog', component: CatalogView },
      {
        path: '/produto/:id',
        name: 'product',
        component: { render: (h: CreateElement) => h('div') },
      },
    ],
  })
  await router.push(url)
  const wrapper = mount(CatalogView, {
    localVue,
    router,
    pinia: createTestingPinia({ createSpy: vi.fn }),
  })
  return { wrapper, router }
}

/** Guarda a query string de cada chamada a /api/products. */
function captureProductRequests() {
  const requests: URLSearchParams[] = []
  server.use(
    http.get('*/api/products', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(listResponse([productSummary()]))
    }),
  )
  return requests
}

describe('CatalogView', () => {
  it('mostra o skeleton e depois a grade com a contagem', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)

    await settle()

    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="product-card"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="result-count"]').text()).toBe('1 produto')
  })

  it('mostra o estado vazio quando a API não retorna produtos', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json(listResponse([]))))
    const { wrapper } = await mountView()
    await settle()
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="empty-clear-filters"]').exists()).toBe(false)
  })

  it('mostra o erro e recupera ao tentar de novo', async () => {
    // O primeiro handler tem prioridade; com `once`, o 500 responde só a primeira chamada.
    server.use(
      http.get('*/api/products', () => HttpResponse.json({}, { status: 500 }), { once: true }),
      http.get('*/api/products', () =>
        HttpResponse.json(listResponse([productSummary(), productSummary({ id: 'cam-2' })])),
      ),
    )
    const { wrapper } = await mountView()
    await settle()
    expect(wrapper.find('[data-test="error"]').attributes('role')).toBe('alert')

    await wrapper.find('[data-test="retry"]').trigger('click')
    await settle()

    expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="product-card"]')).toHaveLength(2)
  })

  it('trocar de página ou de ordenação não busca os filtros de novo; trocar a cor busca', async () => {
    let filterCalls = 0
    server.use(
      http.get('*/api/filters', () => {
        filterCalls++
        return HttpResponse.json(filtersResponse())
      }),
    )
    const { router } = await mountView('/?type=camiseta')
    await settle()
    expect(filterCalls).toBe(1)

    await router.push('/?type=camiseta&page=2')
    await settle()
    await router.push('/?type=camiseta&page=2&sort=price_asc')
    await settle()
    expect(filterCalls).toBe(1)

    await router.push('/?type=camiseta&color=preto')
    await settle()
    expect(filterCalls).toBe(2)
  })

  it('falha só nos filtros também mostra o erro, e tentar de novo recupera', async () => {
    server.use(
      http.get('*/api/filters', () => HttpResponse.json({}, { status: 500 }), { once: true }),
    )
    const { wrapper } = await mountView()
    await settle()
    expect(wrapper.find('[data-test="error"]').exists()).toBe(true)

    await wrapper.find('[data-test="retry"]').trigger('click')
    await settle()

    expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="product-card"]')).toHaveLength(1)
  })

  it('a resposta atrasada de uma busca antiga não sobrescreve a busca nova', async () => {
    server.use(
      http.get('*/api/products', async ({ request }) => {
        const type = new URL(request.url).searchParams.get('type')
        if (type === 'camiseta') await delay(50)
        return HttpResponse.json(
          listResponse([productSummary({ id: type ?? 'todos', name: type ?? 'todos' })]),
        )
      }),
    )
    const { wrapper, router } = await mountView('/')
    await settle()

    // A busca de camiseta demora; a de moletom chega antes. A antiga precisa ser cancelada.
    await router.push('/?type=camiseta')
    await router.push('/?type=moletom')
    await new Promise((resolve) => setTimeout(resolve, 100))

    const names = wrapper.findAll('[data-test="product-name"]').wrappers.map((card) => card.text())
    expect(names).toEqual(['moletom'])
  })

  it('lê os filtros da URL e repassa para a API', async () => {
    const requests = captureProductRequests()
    await mountView('/?type=camiseta&color=branco,preto&page=2&sort=price_asc')
    await settle()

    expect(Object.fromEntries(requests[0]!)).toEqual({
      type: 'camiseta',
      color: 'branco,preto',
      page: '2',
      sort: 'price_asc',
    })
  })

  it('marcar um filtro atualiza a URL, volta para a página 1 e busca de novo', async () => {
    const requests = captureProductRequests()
    const { wrapper, router } = await mountView('/?page=2')
    await settle()

    await wrapper.find('[data-test="type-camiseta"]').trigger('click')
    await settle()

    expect(router.currentRoute.query).toEqual({ type: 'camiseta' })
    expect(requests.at(-1)?.get('type')).toBe('camiseta')
    expect(requests.at(-1)?.get('page')).toBe('1')
  })

  it('com filtro ativo e nenhum resultado, oferece limpar os filtros', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json(listResponse([]))))
    const { wrapper, router } = await mountView('/?color=preto')
    await settle()

    await wrapper.find('[data-test="empty-clear-filters"]').trigger('click')
    expect(router.currentRoute.query).toEqual({})
  })

  it('página além da última leva para a última', async () => {
    server.use(
      http.get('*/api/products', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 1)
        const data = page <= 3 ? [productSummary()] : []
        return HttpResponse.json(listResponse(data, { page, total: 50, totalPages: 3 }))
      }),
    )
    const { wrapper, router } = await mountView('/?page=99')
    await settle()
    await settle()

    expect(router.currentRoute.query).toEqual({ page: '3' })
    expect(wrapper.find('[data-test="page-status"]').text()).toBe('Página 3 de 3')
  })

  it('na primeira página o título da vitrine é o h1; nas outras, o título dos resultados', async () => {
    const first = await mountView('/')
    await settle()
    expect(first.wrapper.find('h1').attributes('id')).toBe('hero-title')

    const second = await mountView('/?page=2')
    await settle()
    expect(second.wrapper.find('#hero-title').exists()).toBe(false)
    expect(second.wrapper.find('h1').attributes('id')).toBe('results-title')
  })

  it('o título de cada card fica um nível abaixo do título dos resultados', async () => {
    const first = await mountView('/')
    await settle()
    expect(first.wrapper.find('#results-title').element.tagName).toBe('H2')
    expect(first.wrapper.find('[data-test="product-name"]').element.tagName).toBe('H3')

    const second = await mountView('/?page=2')
    await settle()
    expect(second.wrapper.find('#results-title').element.tagName).toBe('H1')
    expect(second.wrapper.find('[data-test="product-name"]').element.tagName).toBe('H2')
  })

  it('o quadro principal da vitrine tem um selo fixo, sem prometer o que a API não sabe', async () => {
    const { wrapper } = await mountView('/')
    await settle()
    const seals = wrapper.findAll('[data-test="hero-seal"]')
    // A API padrão do teste devolve um produto: só o primeiro quadro ganha produto e selo.
    expect(seals).toHaveLength(1)
    expect(seals.at(0).text()).toBe('Arte autoral')
  })

  describe('hero estável', () => {
    const camiseta = productSummary({ id: 'exu', name: 'Camiseta Tridente Exu' })
    const moletom = productSummary({
      id: 'canguru',
      name: 'Moletom Canguru',
      type: { id: 'moletom', label: 'Moletom' },
    })
    const caneca = productSummary({
      id: 'bh',
      name: 'Caneca Beagá',
      type: { id: 'caneca', label: 'Caneca' },
    })

    /** Sem filtro, a vitrine tem camiseta e moletom; com type=caneca, só a caneca. */
    function serveCatalog({ unfilteredStatus = 200 } = {}) {
      const requests: URLSearchParams[] = []
      server.use(
        http.get('*/api/products', ({ request }) => {
          const params = new URL(request.url).searchParams
          requests.push(params)
          if (params.get('type') === 'caneca') return HttpResponse.json(listResponse([caneca]))
          if (unfilteredStatus !== 200) return HttpResponse.json({}, { status: unfilteredStatus })
          return HttpResponse.json(listResponse([camiseta, moletom], { total: 180 }))
        }),
      )
      return requests
    }

    const heroText = (wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']) =>
      wrapper.find('section[aria-labelledby="hero-title"]').text()

    it('não muda quando o filtro muda', async () => {
      serveCatalog()
      const { wrapper, router } = await mountView('/')
      await settle()
      expect(heroText(wrapper)).toContain('Camiseta Tridente Exu')

      await router.push('/?type=caneca')
      await settle()

      expect(heroText(wrapper)).toContain('Camiseta Tridente Exu')
      expect(heroText(wrapper)).toContain('Moletom Canguru')
      expect(heroText(wrapper)).not.toContain('Caneca Beagá')
      expect(heroText(wrapper)).toContain('180 produtos')
    })

    it('só faz a busca extra quando a página abre filtrada', async () => {
      const unfilteredOpen = serveCatalog()
      await mountView('/')
      await settle()
      expect(unfilteredOpen).toHaveLength(1)

      const filteredOpen = serveCatalog()
      const { wrapper } = await mountView('/?type=caneca')
      await settle()
      expect(filteredOpen).toHaveLength(2)
      expect(filteredOpen.filter((params) => !params.has('type'))).toHaveLength(1)
      expect(heroText(wrapper)).toContain('Camiseta Tridente Exu')
    })

    it('se a busca extra falhar, a listagem aparece normalmente', async () => {
      serveCatalog({ unfilteredStatus: 500 })
      const { wrapper } = await mountView('/?type=caneca')
      await settle()

      expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
      expect(wrapper.findAll('[data-test="product-card"]')).toHaveLength(1)
      // Sem a vitrine inteira, o hero usa o que já carregou e não mostra um total que não é da loja.
      expect(heroText(wrapper)).toContain('Caneca Beagá')
      expect(heroText(wrapper)).not.toContain('produtos')
    })
  })

  it('mostra os filtros ativos como etiquetas que removem o filtro ao clicar', async () => {
    const { wrapper, router } = await mountView('/?type=camiseta&color=preto')
    await settle()

    const chip = wrapper.find('[aria-label="Remover filtro Preto"]')
    expect(chip.exists()).toBe(true)
    await chip.trigger('click')

    expect(router.currentRoute.query).toEqual({ type: 'camiseta' })
  })

  it('no mobile, o botão "Filtros" abre o painel em formato de folha', async () => {
    const { wrapper } = await mountView()
    await settle()
    expect(wrapper.find('[data-test="filter-sheet"]').exists()).toBe(false)

    await wrapper.find('[data-test="toggle-filters"]').trigger('click')

    expect(wrapper.find('[data-test="filter-sheet"]').exists()).toBe(true)
  })
})

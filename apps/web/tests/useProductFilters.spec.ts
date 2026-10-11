import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { defineComponent, h } from 'vue'
import { useProductFilters } from '@/composables/useProductFilters'

const localVue = createLocalVue()
localVue.use(VueRouter)

async function setup(url: string) {
  // Modo abstract: o router guarda a URL em memória, sem depender do histórico do jsdom.
  const router = new VueRouter({ mode: 'abstract', routes: [{ path: '/', name: 'catalog' }] })
  await router.push(url)

  let filters!: ReturnType<typeof useProductFilters>
  mount(
    defineComponent({
      setup() {
        filters = useProductFilters()
        return () => h('div')
      },
    }),
    { localVue, router },
  )
  return { filters, router }
}

// O router do Vue 2 resolve a navegação de forma assíncrona.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('useProductFilters', () => {
  it('lê os filtros da URL', async () => {
    const { filters } = await setup('/?type=camiseta,moletom&color=preto&page=2')

    expect(filters.query.value).toMatchObject({
      type: ['camiseta', 'moletom'],
      color: ['preto'],
      page: 2,
    })
    expect(filters.activeFilterCount.value).toBe(3)
  })

  it('marcar um filtro volta para a página 1 e mantém a ordenação', async () => {
    const { filters, router } = await setup('/?page=3&sort=price_asc')

    filters.toggleType('caneca')
    await settle()

    expect(router.currentRoute.query).toEqual({ type: 'caneca', sort: 'price_asc' })
  })

  it('marcar de novo desmarca', async () => {
    const { filters, router } = await setup('/?color=branco,preto')

    filters.toggleColor('preto')
    await settle()

    expect(router.currentRoute.query).toEqual({ color: 'branco' })
  })

  it('limpar tira tipo e cor, mas não a ordenação', async () => {
    const { filters, router } = await setup('/?type=camiseta&color=preto&sort=price_desc')

    filters.clearFilters()
    await settle()

    expect(router.currentRoute.query).toEqual({ sort: 'price_desc' })
  })

  // Sem o tratamento de NavigationDuplicated, a promessa rejeitada falharia o teste.
  it('navegar para a URL atual não gera erro', async () => {
    const { filters, router } = await setup('/?type=camiseta')

    filters.updateQuery({ type: ['camiseta'] })
    await settle()

    expect(router.currentRoute.query).toEqual({ type: 'camiseta' })
  })
})

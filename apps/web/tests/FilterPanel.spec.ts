import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import FilterPanel from '@/components/FilterPanel.vue'
import { filtersResponse } from './factories'

const manyColors = Array.from({ length: 10 }, (_, index) => ({
  id: `cor-${index}`,
  name: `Cor ${index}`,
  hex: '#000000',
  count: 1,
}))

function mountPanel(
  selected: { types?: string[]; colors?: string[] } = {},
  filters = filtersResponse(),
) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(FilterPanel as ComponentOptions<Vue>, {
    propsData: {
      filters,
      selectedTypes: selected.types ?? [],
      selectedColors: selected.colors ?? [],
      sort: 'relevance',
    },
  })
}

const button = (wrapper: ReturnType<typeof mountPanel>, testId: string) =>
  wrapper.find(`[data-test="${testId}"]`)

describe('FilterPanel', () => {
  it('mostra cada tipo com a contagem e "Tudo" com a soma', () => {
    const wrapper = mountPanel()
    expect(button(wrapper, 'type-camiseta').text()).toContain('Camiseta')
    expect(button(wrapper, 'type-camiseta').text()).toContain('3')
    expect(button(wrapper, 'all-types').text()).toContain('3')
  })

  it('marca como pressionadas as opções que vieram selecionadas', () => {
    const wrapper = mountPanel({ types: ['camiseta'], colors: ['branco'] })
    expect(button(wrapper, 'type-camiseta').attributes('aria-pressed')).toBe('true')
    expect(button(wrapper, 'all-types').attributes('aria-pressed')).toBe('false')
    expect(button(wrapper, 'color-branco').attributes('aria-pressed')).toBe('true')
    expect(button(wrapper, 'color-preto').attributes('aria-pressed')).toBe('false')
  })

  it('avisa o pai quando uma opção é clicada', async () => {
    const wrapper = mountPanel({ types: ['camiseta'] })
    await button(wrapper, 'type-camiseta').trigger('click')
    await button(wrapper, 'color-preto').trigger('click')
    await button(wrapper, 'all-types').trigger('click')
    await wrapper.find('[data-test="sort-price_asc"]').trigger('change')

    expect(wrapper.emitted('toggle-type')).toEqual([['camiseta']])
    expect(wrapper.emitted('toggle-color')).toEqual([['preto']])
    expect(wrapper.emitted('clear-types')).toHaveLength(1)
    expect(wrapper.emitted('change-sort')).toEqual([['price_asc']])
  })

  it('desabilita a opção sem resultados, mas não se ela já estiver marcada', () => {
    expect(button(mountPanel(), 'type-caneca').attributes('disabled')).toBeDefined()
    expect(
      button(mountPanel({ types: ['caneca'] }), 'type-caneca').attributes('disabled'),
    ).toBeUndefined()
  })

  it('mostra 8 cores e guarda o resto atrás de "+ N cores"', async () => {
    const wrapper = mountPanel({}, filtersResponse({ colors: manyColors }))
    expect(wrapper.findAll('[data-test^="color-cor-"]')).toHaveLength(8)

    await button(wrapper, 'more-colors').trigger('click')

    expect(wrapper.findAll('[data-test^="color-cor-"]')).toHaveLength(10)
    expect(button(wrapper, 'more-colors').exists()).toBe(false)
  })

  it('dá às bolinhas de cor um nome com a contagem, para o leitor de tela', () => {
    expect(button(mountPanel(), 'color-preto').attributes('aria-label')).toBe('Preto, 2 produtos')
  })

  describe('setas da linha de tipos', () => {
    // O jsdom não calcula layout: as medidas da linha e dos chips são simuladas.
    function fakeLayout(
      wrapper: ReturnType<typeof mountPanel>,
      { scrollWidth, clientWidth, scrollLeft = 0 }: Record<string, number>,
    ) {
      const track = wrapper.find('[data-test="type-track"]').element as HTMLElement
      Object.defineProperties(track, {
        scrollWidth: { configurable: true, value: scrollWidth },
        clientWidth: { configurable: true, value: clientWidth },
        scrollLeft: { configurable: true, value: scrollLeft },
      })
      track.getBoundingClientRect = () => ({ right: clientWidth }) as DOMRect
      Array.from(track.children).forEach((chip, index) => {
        chip.getBoundingClientRect = () => ({ width: 100, right: (index + 1) * 100 }) as DOMRect
      })
      track.scrollBy = vi.fn()
      return track
    }

    async function measure(wrapper: ReturnType<typeof mountPanel>) {
      await wrapper.find('[data-test="type-track"]').trigger('scroll')
    }

    it('sem tipos escondidos, não mostra setas', async () => {
      const wrapper = mountPanel()
      fakeLayout(wrapper, { scrollWidth: 200, clientWidth: 200 })
      await measure(wrapper)
      expect(button(wrapper, 'types-back').exists()).toBe(false)
      expect(button(wrapper, 'types-forward').exists()).toBe(false)
    })

    it('com tipos depois da borda, mostra a seta de avançar com quantos faltam', async () => {
      const wrapper = mountPanel()
      fakeLayout(wrapper, { scrollWidth: 200, clientWidth: 150 })
      await measure(wrapper)
      expect(button(wrapper, 'types-back').exists()).toBe(false)
      expect(button(wrapper, 'types-forward').attributes('aria-label')).toBe('Ver mais 1 tipo')
      expect(button(wrapper, 'types-forward').text()).toContain('+1')
    })

    it('a seta rola a linha para o lado certo', async () => {
      const wrapper = mountPanel()
      const track = fakeLayout(wrapper, { scrollWidth: 200, clientWidth: 150 })
      await measure(wrapper)

      await button(wrapper, 'types-forward').trigger('click')

      // 70% da largura visível (150px), para a frente.
      expect(track.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: 105 }))
    })

    it('no fim da linha, só mostra a seta de voltar', async () => {
      const wrapper = mountPanel()
      fakeLayout(wrapper, { scrollWidth: 200, clientWidth: 150, scrollLeft: 50 })
      await measure(wrapper)
      expect(button(wrapper, 'types-back').exists()).toBe(true)
      expect(button(wrapper, 'types-forward').exists()).toBe(false)
    })
  })
})

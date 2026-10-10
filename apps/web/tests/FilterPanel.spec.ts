import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import FilterPanel from '@/components/FilterPanel.vue'
import { filtersResponse } from './factories'

function mountPanel(selected: { types?: string[]; colors?: string[] } = {}) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(FilterPanel as ComponentOptions<Vue>, {
    propsData: {
      filters: filtersResponse(),
      selectedTypes: selected.types ?? [],
      selectedColors: selected.colors ?? [],
    },
  })
}

const checkbox = (wrapper: ReturnType<typeof mountPanel>, testId: string) =>
  wrapper.find(`[data-test="${testId}"]`).element as HTMLInputElement

describe('FilterPanel', () => {
  it('mostra cada opção com a contagem de produtos', () => {
    const wrapper = mountPanel()
    expect(wrapper.text()).toContain('Camiseta')
    expect(wrapper.text()).toContain('Preto')
    expect(
      wrapper.find('[data-test="type-camiseta"]').element.closest('label')?.textContent,
    ).toContain('3')
  })

  it('marca as opções que vieram selecionadas', () => {
    const wrapper = mountPanel({ types: ['camiseta'], colors: ['branco'] })
    expect(checkbox(wrapper, 'type-camiseta').checked).toBe(true)
    expect(checkbox(wrapper, 'color-branco').checked).toBe(true)
    expect(checkbox(wrapper, 'color-preto').checked).toBe(false)
  })

  it('avisa o pai quando uma opção é clicada', async () => {
    const wrapper = mountPanel()
    await wrapper.find('[data-test="type-camiseta"]').trigger('change')
    await wrapper.find('[data-test="color-preto"]').trigger('change')
    expect(wrapper.emitted('toggle-type')).toEqual([['camiseta']])
    expect(wrapper.emitted('toggle-color')).toEqual([['preto']])
  })

  it('desabilita a opção sem resultados, mas não se ela já estiver marcada', () => {
    expect(checkbox(mountPanel(), 'type-caneca').disabled).toBe(true)
    expect(checkbox(mountPanel({ types: ['caneca'] }), 'type-caneca').disabled).toBe(false)
  })

  it('só oferece "Limpar filtros" quando há algo selecionado', async () => {
    expect(mountPanel().find('[data-test="clear-filters"]').exists()).toBe(false)

    const wrapper = mountPanel({ colors: ['preto'] })
    await wrapper.find('[data-test="clear-filters"]').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})

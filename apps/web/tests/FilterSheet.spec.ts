import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import FilterSheet from '@/components/FilterSheet.vue'
import { filtersResponse } from './factories'

async function mountSheet(props: Record<string, unknown> = {}) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  const wrapper = mount(FilterSheet as ComponentOptions<Vue>, {
    propsData: {
      open: false,
      filters: filtersResponse(),
      selectedTypes: [],
      selectedColors: [],
      sort: 'relevance',
      total: 26,
      ...props,
    },
    // attachTo: foco só funciona em elemento que está no documento.
    attachTo: document.body,
  })
  await wrapper.setProps({ open: true })
  await wrapper.vm.$nextTick()
  return wrapper
}

describe('FilterSheet', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('abre como diálogo e põe o foco no botão de fechar', async () => {
    const wrapper = await mountSheet()
    const dialog = wrapper.find('[data-test="filter-sheet"]')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(document.activeElement).toBe(wrapper.find('[data-test="close-sheet"]').element)
  })

  it('o botão principal mostra quantos produtos o filtro atual retorna e fecha', async () => {
    const wrapper = await mountSheet({ total: 1 })
    const apply = wrapper.find('[data-test="sheet-apply"]')
    expect(apply.text()).toBe('Ver 1 produto →')

    await apply.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('repassa as escolhas para o pai', async () => {
    const wrapper = await mountSheet()
    await wrapper.find('[data-test="sort-price_desc"]').trigger('change')
    await wrapper.find('[data-test="sheet-clear"]').trigger('click')
    expect(wrapper.emitted('change-sort')).toEqual([['price_desc']])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('fecha com Esc e clicando fora', async () => {
    const wrapper = await mountSheet()
    await wrapper.find('[data-test="filter-sheet"]').trigger('keydown', { key: 'Escape' })
    await wrapper.find('[data-test="sheet-backdrop"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })
})

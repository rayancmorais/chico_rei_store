import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import PaginationNav from '@/components/PaginationNav.vue'

function mountNav(page: number, totalPages: number, total = totalPages * 24) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(PaginationNav as ComponentOptions<Vue>, {
    propsData: { page, totalPages, total, pageSize: 24 },
  })
}

describe('PaginationNav', () => {
  it('mostra a página atual, o total e o intervalo de itens', () => {
    const wrapper = mountNav(2, 8, 180)
    expect(wrapper.find('[data-test="page-status"]').text()).toBe('Página 2 de 8')
    expect(wrapper.find('[data-test="page-range"]').text()).toBe('25–48 de 180')
  })

  it('bloqueia "Anterior" na primeira página e "Próxima" na última', () => {
    expect(mountNav(1, 8).find('[data-test="prev-page"]').attributes('disabled')).toBeDefined()
    expect(mountNav(8, 8).find('[data-test="next-page"]').attributes('disabled')).toBeDefined()
  })

  it('pede a página vizinha ao clicar', async () => {
    const wrapper = mountNav(3, 8)
    await wrapper.find('[data-test="prev-page"]').trigger('click')
    await wrapper.find('[data-test="next-page"]').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[2], [4]])
  })

  it('pula direto para um número e marca a página atual', async () => {
    const wrapper = mountNav(3, 5)
    expect(wrapper.find('[data-test="page-3"]').attributes('aria-current')).toBe('page')

    await wrapper.find('[data-test="page-5"]').trigger('click')
    await wrapper.find('[data-test="page-3"]').trigger('click')

    expect(wrapper.emitted('change')).toEqual([[5]])
  })
})

import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import PaginationNav from '@/components/PaginationNav.vue'

function mountNav(page: number, totalPages: number) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(PaginationNav as ComponentOptions<Vue>, { propsData: { page, totalPages } })
}

describe('PaginationNav', () => {
  it('mostra a página atual e o total', () => {
    expect(mountNav(2, 8).find('[data-test="page-status"]').text()).toBe('Página 2 de 8')
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
})

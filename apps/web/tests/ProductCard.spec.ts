import { mount, RouterLinkStub } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { productSummary } from './factories'

function mountCard(overrides: Parameters<typeof productSummary>[0] = {}) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(ProductCard as ComponentOptions<Vue>, {
    propsData: { product: productSummary(overrides) },
    stubs: { RouterLink: RouterLinkStub },
  })
}

const color = (id: string) => ({ id, name: id, hex: '#000000' })

describe('ProductCard', () => {
  it('leva para a página do produto', () => {
    const wrapper = mountCard({ id: '21404' })
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
      name: 'product',
      params: { id: '21404' },
    })
  })

  it('mostra nome, tipo e preço formatado', () => {
    const wrapper = mountCard({ priceCents: 6690 })
    expect(wrapper.text()).toContain('Camiseta Teste')
    expect(wrapper.text()).toContain('Camiseta')
    expect(wrapper.find('[data-test="price"]').text()).toMatch(/R\$\s66,90/)
  })

  it('só mostra o preço original quando o produto está em promoção', () => {
    expect(mountCard().find('[data-test="original-price"]').exists()).toBe(false)

    const onSale = mountCard({ priceCents: 5990, originalPriceCents: 7990 })
    expect(onSale.find('[data-test="original-price"]').text()).toMatch(/R\$\s79,90/)
  })

  it('resume as cores que não cabem no card', () => {
    const wrapper = mountCard({ colors: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(color) })
    expect(wrapper.find('[data-test="more-colors"]').text()).toBe('+2')
    expect(wrapper.text()).toContain('Disponível em 7 cores')
  })
})

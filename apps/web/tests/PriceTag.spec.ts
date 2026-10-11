import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import PriceTag from '@/components/PriceTag.vue'

function mountPrice(priceCents: number, originalPriceCents: number | null) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(PriceTag as ComponentOptions<Vue>, {
    propsData: { product: { priceCents, originalPriceCents } },
  })
}

describe('PriceTag', () => {
  it('sem promoção, mostra só o preço atual', () => {
    const wrapper = mountPrice(6690, null)
    expect(wrapper.text()).toMatch(/^R\$\s66,90$/)
    expect(wrapper.find('[data-test="original-price"]').exists()).toBe(false)
  })

  it('em promoção, o leitor de tela ouve "De … por …"', () => {
    const wrapper = mountPrice(6690, 7990)
    expect(wrapper.find('[data-test="original-price"]').text()).toMatch(/R\$\s79,90/)
    expect(wrapper.text().replace(/\s+/g, ' ')).toMatch(/^De R\$ 79,90 por R\$ 66,90$/)
  })
})

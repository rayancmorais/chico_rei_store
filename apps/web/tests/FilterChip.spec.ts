import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import FilterChip from '@/components/FilterChip.vue'

function mountChip(props: Record<string, unknown>) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(FilterChip as ComponentOptions<Vue>, {
    propsData: { label: 'Caneca', pressed: false, ...props },
  })
}

const isDisabled = (props: Record<string, unknown>) =>
  mountChip(props).attributes('disabled') !== undefined

describe('FilterChip', () => {
  it('desabilita a opção com zero resultados', () => {
    expect(isDisabled({ count: 0 })).toBe(true)
    expect(isDisabled({ count: 2 })).toBe(false)
  })

  it('opção marcada nunca desabilita, para poder ser desmarcada', () => {
    expect(isDisabled({ count: 0, pressed: true })).toBe(false)
  })

  it('"Tudo" (alwaysEnabled) nunca desabilita, mesmo com zero', () => {
    expect(isDisabled({ count: 0, alwaysEnabled: true })).toBe(false)
  })

  it('sem mostrar a contagem, a regra continua valendo', () => {
    const chip = mountChip({ count: 0, showCount: false })
    expect(chip.attributes('disabled')).toBeDefined()
    expect(chip.text()).toBe('Caneca')
  })
})

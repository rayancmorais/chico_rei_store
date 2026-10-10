import { formatPrice } from '@/utils/format'

describe('formatPrice', () => {
  // O Intl separa "R$" do valor com espaço não separável (U+00A0), não com espaço comum.

  it('formata centavos em reais no padrão brasileiro', () => {
    expect(formatPrice(6690)).toBe('R$\u00a066,90')
    expect(formatPrice(123456)).toBe('R$\u00a01.234,56')
  })
})

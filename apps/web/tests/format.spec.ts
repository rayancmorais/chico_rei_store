import { formatPrice, formatPriceAmount, pluralize, pluralTypeLabel } from '@/utils/format'

describe('formatPriceAmount', () => {
  it('formata só o valor, sem o símbolo', () => {
    expect(formatPriceAmount(7290)).toBe('72,90')
    expect(formatPriceAmount(123456)).toBe('1.234,56')
  })
})

describe('formatPrice', () => {
  // O Intl separa "R$" do valor com espaço não separável (U+00A0), não com espaço comum.
  it('formata centavos em reais no padrão brasileiro', () => {
    expect(formatPrice(6690)).toBe('R$ 66,90')
    expect(formatPrice(123456)).toBe('R$ 1.234,56')
  })
})

describe('pluralize', () => {
  it('usa o singular só para 1', () => {
    expect(pluralize(1, 'produto', 'produtos')).toBe('1 produto')
    expect(pluralize(0, 'produto', 'produtos')).toBe('0 produtos')
    expect(pluralize(3, 'item', 'itens')).toBe('3 itens')
  })
})

describe('pluralTypeLabel', () => {
  it('põe no plural os tipos reais da loja que soam naturais no plural', () => {
    expect(pluralTypeLabel('Camiseta')).toBe('Camisetas')
    expect(pluralTypeLabel('Caderno')).toBe('Cadernos')
    expect(pluralTypeLabel('Moletom')).toBe('Moletons')
  })

  it('mantém como está o que já é plural ou não segue a regra simples', () => {
    expect(pluralTypeLabel('Kit de Imãs')).toBe('Kit de Imãs')
    expect(pluralTypeLabel('Ecobag')).toBe('Ecobag')
  })
})

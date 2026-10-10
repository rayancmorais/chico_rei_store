import { pageItems, rangeLabel } from '@/utils/pagination'

describe('pageItems', () => {
  it('mostra todas as páginas quando são poucas', () => {
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('mantém primeira, última e vizinhas da atual, com reticências no resto', () => {
    expect(pageItems(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
  })

  it('não cria reticências coladas no começo ou no fim', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 'gap', 12])
    expect(pageItems(12, 12)).toEqual([1, 'gap', 11, 12])
    expect(pageItems(3, 12)).toEqual([1, 2, 3, 4, 'gap', 12])
  })
})

describe('rangeLabel', () => {
  it('descreve o intervalo da página', () => {
    expect(rangeLabel(2, 12, 26)).toBe('13–24 de 26')
    expect(rangeLabel(3, 12, 26)).toBe('25–26 de 26')
  })

  it('fica vazio sem resultados', () => {
    expect(rangeLabel(1, 24, 0)).toBe('')
  })
})

import { parseCatalogQuery, toggleItem, toRouteQuery } from '@/utils/catalog-query'

describe('parseCatalogQuery', () => {
  it('usa os padrões quando a URL não tem filtros', () => {
    expect(parseCatalogQuery({})).toEqual({ type: [], color: [], page: 1, sort: 'relevance' })
  })

  it('lê listas separadas por vírgula, página e ordenação', () => {
    expect(
      parseCatalogQuery({ type: 'camiseta', color: 'preto, branco', page: '3', sort: 'price_asc' }),
    ).toEqual({ type: ['camiseta'], color: ['preto', 'branco'], page: 3, sort: 'price_asc' })
  })

  it('troca valores inválidos pelo padrão em vez de quebrar', () => {
    expect(parseCatalogQuery({ page: 'abc', sort: 'mais_vendidos' })).toMatchObject({
      page: 1,
      sort: 'relevance',
    })
    expect(parseCatalogQuery({ page: '0' }).page).toBe(1)
    expect(parseCatalogQuery({ page: '2.5' }).page).toBe(1)
  })

  it('usa o primeiro valor quando o parâmetro se repete', () => {
    expect(parseCatalogQuery({ type: ['camiseta', 'caneca'] }).type).toEqual(['camiseta'])
  })
})

describe('toRouteQuery', () => {
  it('deixa os valores padrão fora da URL', () => {
    expect(toRouteQuery({ type: [], color: [], page: 1, sort: 'relevance' })).toEqual({})
  })

  it('ordena as listas para o mesmo filtro gerar sempre a mesma URL', () => {
    expect(
      toRouteQuery({ type: ['caneca', 'camiseta'], color: ['preto'], page: 2, sort: 'price_desc' }),
    ).toEqual({ type: 'camiseta,caneca', color: 'preto', page: '2', sort: 'price_desc' })
  })

  it('volta ao mesmo filtro depois de ir para a URL e voltar', () => {
    const query = {
      type: ['camiseta'],
      color: ['branco', 'preto'],
      page: 4,
      sort: 'price_asc' as const,
    }
    expect(parseCatalogQuery(toRouteQuery(query))).toEqual(query)
  })
})

describe('toggleItem', () => {
  it('adiciona o item que não está na lista e remove o que está', () => {
    expect(toggleItem(['preto'], 'branco')).toEqual(['preto', 'branco'])
    expect(toggleItem(['preto', 'branco'], 'preto')).toEqual(['branco'])
  })
})

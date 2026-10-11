import { ProductQuerySchema } from '@chico_rei_store/shared'
import { buildFilters, listProducts } from '../src/services/product-service'
import { branco, catalog, preto, product } from './factories'

const query = (params: Record<string, string> = {}) => ProductQuerySchema.parse(params)
const ids = (params: Record<string, string>) =>
  listProducts(catalog, query(params)).data.map((p) => p.id)

describe('listProducts', () => {
  it('sem filtros, devolve tudo na ordem da vitrine', () => {
    expect(ids({})).toEqual(['1', '2', '3', '4'])
  })

  it('na relevância, quem tem várias cores e uma foto só vai para o fim, sem mudar o resto', () => {
    const photo = (id: string) => `https://umapenca.imgix.net/${id}.png`
    const products = [
      product({
        id: 'personalizada',
        colors: [preto, branco],
        imagesByColor: { preto: photo('p') },
      }),
      product({
        id: 'troca-de-cor',
        colors: [preto, branco],
        imagesByColor: { preto: photo('a'), branco: photo('b') },
      }),
      product({ id: 'uma-cor', colors: [preto] }),
    ]

    const ids = listProducts(products, query()).data.map((p) => p.id)

    expect(ids).toEqual(['troca-de-cor', 'uma-cor', 'personalizada'])
  })

  it('combina valores da mesma dimensão com OU', () => {
    expect(ids({ type: 'moletom,caneca' })).toEqual(['3', '4'])
  })

  it('combina dimensões diferentes com E', () => {
    expect(ids({ type: 'camiseta', color: 'preto' })).toEqual(['1'])
  })

  it('devolve lista vazia quando a combinação não tem produtos', () => {
    const result = listProducts(catalog, query({ type: 'caneca', color: 'vermelho' }))

    expect(result.data).toEqual([])
    expect(result.meta.total).toBe(0)
  })

  it('ignora valores desconhecidos, para links antigos não quebrarem', () => {
    expect(ids({ type: 'nao-existe' })).toEqual([])
  })

  it('pagina e calcula o total de páginas', () => {
    const result = listProducts(catalog, query({ limit: '3', page: '2' }))

    expect(result.data.map((p) => p.id)).toEqual(['4'])
    expect(result.meta).toEqual({ total: 4, page: 2, limit: 3, totalPages: 2 })
  })

  it('ordena por preço sem alterar o catálogo original', () => {
    expect(ids({ sort: 'price_asc' })).toEqual(['4', '2', '1', '3'])
    expect(ids({ sort: 'price_desc' })).toEqual(['3', '1', '2', '4'])
    expect(catalog.map((p) => p.id)).toEqual(['1', '2', '3', '4'])
  })

  it('devolve só os campos que o card usa', () => {
    const [first] = listProducts(catalog, query()).data

    expect(first).not.toHaveProperty('description')
    expect(first).not.toHaveProperty('sizes')
  })
})

describe('buildFilters', () => {
  const count = (list: { id: string; count: number }[], id: string) =>
    list.find((item) => item.id === id)?.count

  it('sem filtros, conta todos os produtos de cada opção', () => {
    const filters = buildFilters(catalog, query())

    expect(count(filters.types, 'camiseta')).toBe(2)
    expect(count(filters.colors, 'preto')).toBe(2)
  })

  it('a contagem de cores respeita o tipo marcado, mas não as próprias cores', () => {
    const filters = buildFilters(catalog, query({ type: 'camiseta', color: 'preto' }))

    expect(count(filters.colors, 'vermelho')).toBe(1)
    expect(count(filters.colors, 'branco')).toBe(1)
  })

  it('mostra opções que dariam zero, em vez de escondê-las', () => {
    const filters = buildFilters(catalog, query({ type: 'caneca' }))

    expect(count(filters.colors, 'vermelho')).toBe(0)
  })
})

import type {
  FiltersResponse,
  Product,
  ProductListResponse,
  ProductQuery,
  ProductSort,
  ProductSummary,
} from '@chico_rei_store/shared'

type FilterQuery = Pick<ProductQuery, 'type' | 'color'>

// Vazio = sem filtro nessa dimensão. Dentro da dimensão vale OU; entre dimensões, E.
const matchesTypes = (product: Product, types: string[]) =>
  types.length === 0 || types.includes(product.type.id)

const matchesColors = (product: Product, colors: string[]) =>
  colors.length === 0 || product.colors.some((color) => colors.includes(color.id))

const comparators: Record<ProductSort, ((a: Product, b: Product) => number) | null> = {
  relevance: null, // ordem da vitrine original
  price_asc: (a, b) => a.priceCents - b.priceCents,
  price_desc: (a, b) => b.priceCents - a.priceCents,
}

const toSummary = ({
  id,
  name,
  type,
  priceCents,
  originalPriceCents,
  image,
  colors,
}: Product): ProductSummary => ({
  id,
  name,
  type,
  priceCents,
  originalPriceCents,
  image,
  colors,
})

export function listProducts(
  products: readonly Product[],
  query: ProductQuery,
): ProductListResponse {
  const filtered = products.filter(
    (product) => matchesTypes(product, query.type) && matchesColors(product, query.color),
  )
  const comparator = comparators[query.sort]
  const sorted = comparator ? [...filtered].sort(comparator) : filtered

  const start = (query.page - 1) * query.limit
  return {
    data: sorted.slice(start, start + query.limit).map(toSummary),
    meta: {
      total: sorted.length,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(sorted.length / query.limit),
    },
  }
}

/**
 * Contagem de facetas: cada cor conta os produtos que passam no filtro de tipo ativo
 * (e vice-versa), nunca no próprio. Assim a contagem mostra quantos produtos a pessoa
 * veria ao marcar aquela opção, e opções que dariam zero ficam visíveis como zero.
 */
export function buildFilters(products: readonly Product[], query: FilterQuery): FiltersResponse {
  const types = new Map<string, FiltersResponse['types'][number]>()
  const colors = new Map<string, FiltersResponse['colors'][number]>()

  for (const product of products) {
    const type = types.get(product.type.id) ?? { ...product.type, count: 0 }
    if (matchesColors(product, query.color)) type.count++
    types.set(type.id, type)

    for (const color of product.colors) {
      const entry = colors.get(color.id) ?? { ...color, count: 0 }
      if (matchesTypes(product, query.type)) entry.count++
      colors.set(color.id, entry)
    }
  }

  const byCountDesc = (a: { count: number }, b: { count: number }) => b.count - a.count
  return {
    types: [...types.values()].sort(byCountDesc),
    colors: [...colors.values()].sort(byCountDesc),
  }
}

import type { Route } from 'vue-router'
import type { ProductSort } from '@chico_rei_store/shared'

export interface CatalogQuery {
  type: string[]
  color: string[]
  page: number
  sort: ProductSort
}

export const DEFAULT_SORT: ProductSort = 'relevance'
const SORTS: readonly ProductSort[] = ['relevance', 'price_asc', 'price_desc']

type QueryValue = Route['query'][string] | undefined

// `?type=a&type=b` chega como array; a URL que o app gera usa vírgula, então vale o primeiro.
function firstValue(value: QueryValue) {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ?? undefined
}

function toList(value: QueryValue) {
  return (
    firstValue(value)
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  )
}

function isSort(value: string | undefined): value is ProductSort {
  return SORTS.includes(value as ProductSort)
}

/** A URL é digitável: valor inválido vira o padrão, em vez de virar erro 400 da API. */
export function parseCatalogQuery(query: Route['query']): CatalogQuery {
  const page = Number(firstValue(query.page))
  const sort = firstValue(query.sort)
  return {
    type: toList(query.type),
    color: toList(query.color),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    sort: isSort(sort) ? sort : DEFAULT_SORT,
  }
}

// Valores padrão ficam fora da URL e as listas saem ordenadas: o mesmo filtro gera sempre a mesma
// URL, o que vale para o histórico, para links compartilhados e para o cache HTTP da API.
export function toRouteQuery(query: CatalogQuery): Record<string, string> {
  const result: Record<string, string> = {}
  if (query.type.length) result.type = [...query.type].sort().join(',')
  if (query.color.length) result.color = [...query.color].sort().join(',')
  if (query.sort !== DEFAULT_SORT) result.sort = query.sort
  if (query.page > 1) result.page = String(query.page)
  return result
}

export function toggleItem(list: readonly string[], item: string) {
  return list.includes(item) ? list.filter((current) => current !== item) : [...list, item]
}

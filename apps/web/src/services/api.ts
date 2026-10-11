import type {
  FiltersResponse,
  Product,
  ProductListResponse,
  ProductSort,
} from '@chico_rei_store/shared'
import { get } from './http'

export type ProductListParams = {
  type?: string[]
  color?: string[]
  page?: number
  limit?: number
  sort?: ProductSort
}

export function fetchProducts(params: ProductListParams = {}, signal?: AbortSignal) {
  return get<ProductListResponse>('/products', { params, signal })
}

export function fetchFilters(
  params: Pick<ProductListParams, 'type' | 'color'> = {},
  signal?: AbortSignal,
) {
  return get<FiltersResponse>('/filters', { params, signal })
}

export function fetchProduct(id: string, signal?: AbortSignal) {
  return get<Product>(`/products/${encodeURIComponent(id)}`, { signal })
}

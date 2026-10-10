import axios from 'axios'
import type { FiltersResponse, ProductListResponse, ProductSort } from '@chico_rei_store/shared'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
})

export interface ProductListParams {
  type?: string[]
  color?: string[]
  page?: number
  limit?: number
  sort?: ProductSort
}

function toQueryParams({ type, color, ...rest }: ProductListParams) {
  return {
    ...rest,
    type: type?.length ? type.join(',') : undefined,
    color: color?.length ? color.join(',') : undefined,
  }
}

export async function fetchProducts(params: ProductListParams = {}, signal?: AbortSignal) {
  const { data } = await http.get<ProductListResponse>('/products', {
    params: toQueryParams(params),
    signal,
  })
  return data
}

export async function fetchFilters(
  params: Pick<ProductListParams, 'type' | 'color'> = {},
  signal?: AbortSignal,
) {
  const { data } = await http.get<FiltersResponse>('/filters', {
    params: toQueryParams(params),
    signal,
  })
  return data
}

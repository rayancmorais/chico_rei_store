import type { ProductListResponse, ProductSummary } from '@chico_rei_store/shared'

export function productSummary(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 'cam-1',
    name: 'Camiseta Teste',
    type: { id: 'camiseta', label: 'Camiseta' },
    priceCents: 7990,
    originalPriceCents: null,
    image: 'https://umapenca.imgix.net/1/a.png',
    colors: [{ id: 'preto', name: 'Preto', hex: '#000000' }],
    ...overrides,
  }
}

export function listResponse(products: ProductSummary[]): ProductListResponse {
  return {
    data: products,
    meta: { total: products.length, page: 1, limit: 24, totalPages: 1 },
  }
}

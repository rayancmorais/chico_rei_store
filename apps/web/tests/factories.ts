import type {
  FiltersResponse,
  Product,
  ProductListResponse,
  ProductSummary,
} from '@chico_rei_store/shared'

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

export function listResponse(
  products: ProductSummary[],
  meta: Partial<ProductListResponse['meta']> = {},
): ProductListResponse {
  return {
    data: products,
    meta: { total: products.length, page: 1, limit: 24, totalPages: 1, ...meta },
  }
}

export function filtersResponse(overrides: Partial<FiltersResponse> = {}): FiltersResponse {
  return {
    types: [
      { id: 'camiseta', label: 'Camiseta', count: 3 },
      { id: 'caneca', label: 'Caneca', count: 0 },
    ],
    colors: [
      { id: 'preto', name: 'Preto', hex: '#000000', count: 2 },
      { id: 'branco', name: 'Branco', hex: '#ffffff', count: 1 },
    ],
    ...overrides,
  }
}

export function product(overrides: Partial<Product> = {}): Product {
  return {
    ...productSummary(),
    colors: [
      { id: 'preto', name: 'Preto', hex: '#000000' },
      { id: 'branco', name: 'Branco', hex: '#ffffff' },
    ],
    description: 'Camiseta de algodão.',
    sizes: ['P', 'M', 'G'],
    models: ['Tradicional'],
    sourceUrl: 'https://umapenca.com/produto/cam-1.html',
    enriched: { colors: false, sizes: true, description: true },
    ...overrides,
  }
}

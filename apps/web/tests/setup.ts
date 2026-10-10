import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { ProductSummary } from '@chico_rei_store/shared'

const catalog: ProductSummary[] = [
  {
    id: 'cam-1',
    name: 'Camiseta Teste',
    type: { id: 'camiseta', label: 'Camiseta' },
    priceCents: 7990,
    originalPriceCents: null,
    image: 'https://x.test/a.jpg',
    colors: [],
  },
]

export const server = setupServer(
  http.get('*/api/products', () => HttpResponse.json({ data: catalog })),
)

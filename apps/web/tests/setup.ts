import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { filtersResponse, listResponse, product, productSummary } from './factories'

export const server = setupServer(
  http.get('*/api/products', () => HttpResponse.json(listResponse([productSummary()]))),
  http.get('*/api/filters', () => HttpResponse.json(filtersResponse())),
  http.get('*/api/products/:id', ({ params }) =>
    HttpResponse.json(product({ id: String(params.id) })),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

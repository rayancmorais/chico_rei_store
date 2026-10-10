import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { listResponse, productSummary } from './factories'

export const server = setupServer(
  http.get('*/api/products', () => HttpResponse.json(listResponse([productSummary()]))),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

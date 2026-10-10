import Vue from 'vue'
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

// Warning do Vue (prop com tipo errado, chave duplicada...) vira teste falhando, e não só log.
Vue.config.warnHandler = (message) => {
  throw new Error(`[Vue warn] ${message}`)
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

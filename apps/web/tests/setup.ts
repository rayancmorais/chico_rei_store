import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('*/api/products', () =>
    HttpResponse.json({
      data: [
        {
          id: 'cam-1',
          name: 'Camiseta Teste',
          type: 'camiseta',
          priceCents: 7990,
          image: 'https://x.test/a.jpg',
          colors: [],
        },
      ],
    }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

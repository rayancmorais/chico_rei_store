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

/**
 * O jsdom troca o AbortController global pelo dele, e o fetch do Node 24 recusa esse sinal
 * ("Expected signal to be an instance of AbortSignal"). No navegador existe um AbortController só,
 * então o problema é só dos testes: aqui o sinal fica de fora do fetch e o cancelamento é repassado
 * à mão, rejeitando com AbortError como o fetch faria. Instalado depois do MSW, para envolvê-lo.
 */
function passAbortThroughFetch() {
  const mswFetch = globalThis.fetch
  globalThis.fetch = ((input: RequestInfo | URL, init: RequestInit = {}) => {
    const { signal, ...rest } = init
    if (!signal) return mswFetch(input, rest)
    return new Promise<Response>((resolve, reject) => {
      const abort = () => reject(new DOMException('The operation was aborted.', 'AbortError'))
      if (signal.aborted) return abort()
      signal.addEventListener('abort', abort, { once: true })
      mswFetch(input, rest).then(resolve, reject)
    })
  }) as typeof fetch
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  passAbortThroughFetch()
})
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

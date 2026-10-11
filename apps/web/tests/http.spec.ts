import { get, HttpError, isCancelled, TimeoutError } from '@/services/http'

// `fetch` falso: os testes controlam a resposta e o momento do abort sem depender da rede nem do MSW.
function stubFetch(respond: (url: URL, init: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn(respond)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

// Fica pendurado até o sinal abortar, como um servidor que não responde.
const hang = (_url: URL, init: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    init.signal?.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')),
    )
  })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('get', () => {
  it('devolve o JSON da resposta', async () => {
    stubFetch(async () => Response.json({ ok: true }))
    await expect(get('/health')).resolves.toEqual({ ok: true })
  })

  it('monta a query: listas em CSV, sem undefined nem lista vazia', async () => {
    const fetchMock = stubFetch(async () => Response.json({}))

    await get('/products', {
      params: { type: ['camiseta', 'moletom'], color: [], page: 2, sort: undefined },
    })

    const url = fetchMock.mock.calls[0]![0]
    expect(url.pathname).toBe('/api/products')
    expect(Object.fromEntries(url.searchParams)).toEqual({ type: 'camiseta,moletom', page: '2' })
  })

  it('resposta de erro vira HttpError com o status', async () => {
    stubFetch(async () => new Response('{}', { status: 404 }))

    const error = await get('/products/999').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).status).toBe(404)
  })

  it('cancelamento por quem chamou é reconhecido como cancelamento, não como erro', async () => {
    stubFetch(hang)
    const controller = new AbortController()

    const pending = get('/products', { signal: controller.signal }).catch((e: unknown) => e)
    controller.abort()
    const error = await pending

    expect(isCancelled(error)).toBe(true)
    expect(error).not.toBeInstanceOf(TimeoutError)
  })

  it('sem resposta em 10 s vira TimeoutError, que a tela trata como erro', async () => {
    vi.useFakeTimers()
    stubFetch(hang)

    const pending = get('/products').catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(10_000)
    const error = await pending

    expect(error).toBeInstanceOf(TimeoutError)
    expect(isCancelled(error)).toBe(false)
  })
})

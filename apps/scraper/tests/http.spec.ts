import { fetchHtml, HttpError } from '../src/http'

const options = { userAgent: 'teste', timeoutMs: 1000, retries: 2 }
const html = (status: number, body = '<html></html>') => new Response(body, { status })

describe('fetchHtml', () => {
  it('devolve o HTML e envia o User-Agent do projeto', async () => {
    const fetchFn = vi.fn().mockResolvedValue(html(200, '<p>ok</p>'))

    await expect(fetchHtml('https://x.test', { ...options, fetchFn })).resolves.toBe('<p>ok</p>')
    expect(fetchFn.mock.calls[0]?.[1]?.headers).toMatchObject({ 'User-Agent': 'teste' })
  })

  it('tenta de novo em erro 5xx, com espera crescente', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(html(503))
      .mockResolvedValueOnce(html(502))
      .mockResolvedValueOnce(html(200, 'ok'))

    await expect(fetchHtml('https://x.test', { ...options, fetchFn, wait })).resolves.toBe('ok')
    expect(wait.mock.calls.map(([ms]) => ms)).toEqual([2000, 4000])
  })

  it('não repete erro 404, que não se resolve tentando de novo', async () => {
    const fetchFn = vi.fn().mockResolvedValue(html(404))

    await expect(fetchHtml('https://x.test', { ...options, fetchFn })).rejects.toBeInstanceOf(
      HttpError,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('desiste depois do número máximo de tentativas', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('fetch failed'))

    await expect(fetchHtml('https://x.test', { ...options, fetchFn, wait })).rejects.toThrow(
      'fetch failed',
    )
    expect(fetchFn).toHaveBeenCalledTimes(3)
  })
})

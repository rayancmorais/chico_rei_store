const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const TIMEOUT_MS = 10_000

export type QueryParams = Record<string, string | number | readonly string[] | undefined>

export class HttpError extends Error {
  constructor(
    readonly status: number,
    url: string,
  ) {
    super(`HTTP ${status} em ${url}`)
    this.name = 'HttpError'
  }
}

/** A API demorou demais. É erro de verdade (a tela mostra o estado de erro), não cancelamento. */
export class TimeoutError extends Error {
  constructor(url: string) {
    super(`Sem resposta em ${TIMEOUT_MS / 1000} s: ${url}`)
    this.name = 'TimeoutError'
  }
}

// Pelo nome, e não por `instanceof DOMException`: nos testes, o jsdom e o Node têm cada um o seu.
export const isCancelled = (error: unknown) =>
  typeof error === 'object' && error !== null && (error as Error).name === 'AbortError'

function buildUrl(path: string, params: QueryParams = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    // A API lê listas em CSV (`type=camiseta,moletom`); lista vazia é o mesmo que não filtrar.
    const serialized = Array.isArray(value) ? value.join(',') : String(value)
    if (serialized !== '') url.searchParams.set(key, serialized)
  }
  return url
}

/**
 * GET em JSON com timeout. O fetch recebe um sinal só, que aborta por dois motivos: quem chamou
 * cancelou (busca mais nova) ou o tempo acabou. `timedOut` separa os dois, porque só o cancelamento
 * deve ser ignorado pela tela. Sem `AbortSignal.any`, que nem todo ambiente tem.
 */
export async function get<T>(
  path: string,
  { params, signal }: { params?: QueryParams; signal?: AbortSignal } = {},
): Promise<T> {
  const url = buildUrl(path, params)
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, TIMEOUT_MS)
  const cancel = () => controller.abort()
  if (signal?.aborted) cancel()
  signal?.addEventListener('abort', cancel)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new HttpError(response.status, url.pathname)
    return (await response.json()) as T
  } catch (error) {
    if (timedOut) throw new TimeoutError(url.pathname)
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`HTTP ${status} em ${url}`)
  }
}

interface FetchHtmlOptions {
  userAgent: string
  timeoutMs: number
  retries: number

  /** Espera entre tentativas. Injetável para os testes não esperarem de verdade. */

  wait?: (ms: number) => Promise<void>
  fetchFn?: typeof fetch
}

// 4xx (exceto 429) é erro nosso ou página inexistente: repetir não resolve.

const isRetryable = (error: unknown) =>
  !(error instanceof HttpError) || error.status === 429 || error.status >= 500

export async function fetchHtml(url: string, options: FetchHtmlOptions): Promise<string> {
  const { userAgent, timeoutMs, retries, wait = sleep, fetchFn = fetch } = options

  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetchFn(url, {
        headers: { 'User-Agent': userAgent, Accept: 'text/html' },
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) throw new HttpError(response.status, url)
      return await response.text()
    } catch (error) {
      if (attempt >= retries || !isRetryable(error)) throw error
      await wait(2000 * 2 ** attempt) // backoff: 2 s, 4 s
    }
  }
}

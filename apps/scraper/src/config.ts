import { z } from 'zod'

// Limites da coleta: no máximo 5 páginas (PDF) e 5 s entre requisições. O PDF exige pelo menos
// 1 s, mas o robots.txt da Uma Penca pede `Crawl-delay: 5`, e vale o mais restritivo.
const MAX_PAGES = 5
const MIN_DELAY_MS = 5000
const BASE_URL = 'https://umapenca.com/loja/'

const integer = () =>
  z.coerce.number({ error: 'deve ser um número' }).int('deve ser um número inteiro')

const ScraperEnvSchema = z.object({
  SCRAPER_MAX_PAGES: integer()
    .min(1, 'deve ser pelo menos 1')
    .max(MAX_PAGES, `deve ser no máximo ${MAX_PAGES}`)
    .default(MAX_PAGES),
  SCRAPER_DELAY_MS: integer()
    .min(MIN_DELAY_MS, `deve ser pelo menos ${MIN_DELAY_MS}`)
    .default(MIN_DELAY_MS),
})

/** Erro com uma linha por campo inválido, pronta para o terminal ("SCRAPER_DELAY_MS deve ser…"). */
export function parseScraperEnv(env: NodeJS.ProcessEnv) {
  const result = ScraperEnvSchema.safeParse(env)
  if (!result.success) {
    const lines = result.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`)
    throw new Error(lines.join('\n'))
  }
  return result.data
}

export function loadConfig(env: NodeJS.ProcessEnv) {
  const { SCRAPER_MAX_PAGES, SCRAPER_DELAY_MS } = parseScraperEnv(env)
  return {
    baseUrl: BASE_URL,
    maxPages: SCRAPER_MAX_PAGES,
    delayMs: SCRAPER_DELAY_MS,
    timeoutMs: 10_000,
    retries: 2,
    userAgent: 'chico-rei-store-teste-tecnico (scraper de estudo; 5 paginas, 1 req a cada 5 s)',
  }
}

export const pageUrl = (page: number) => (page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`)

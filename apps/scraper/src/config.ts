import { z } from 'zod'

// Limites da coleta: no máximo 5 páginas (PDF) e 5 s entre requisições. O PDF exige pelo menos
// 1 s, mas o robots.txt da Uma Penca pede `Crawl-delay: 5`, e vale o mais restritivo.
const MAX_PAGES = 5
const MIN_DELAY_MS = 5000

const ScraperEnvSchema = z.object({
  SCRAPER_MAX_PAGES: z.coerce.number().int().min(1).max(MAX_PAGES).default(MAX_PAGES),
  SCRAPER_DELAY_MS: z.coerce.number().int().min(MIN_DELAY_MS).default(MIN_DELAY_MS),
})

export const parseScraperEnv = (env: NodeJS.ProcessEnv) => ScraperEnvSchema.parse(env)

const env = parseScraperEnv(process.env)

export const config = {
  baseUrl: 'https://umapenca.com/loja/',
  maxPages: env.SCRAPER_MAX_PAGES,
  delayMs: env.SCRAPER_DELAY_MS,
  timeoutMs: 10_000,
  retries: 2,
  userAgent: 'chico-rei-store-teste-tecnico (scraper de estudo; 5 paginas, 1 req a cada 5 s)',
}

export const pageUrl = (page: number) =>
  page === 1 ? config.baseUrl : `${config.baseUrl}?page=${page}`

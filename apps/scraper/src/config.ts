import { z } from 'zod'

/** Limites do PDF: no máximo 5 páginas e pelo menos 1 s entre requisições. */

const PDF_MAX_PAGES = 5
const PDF_MIN_DELAY_MS = 1000

const ScraperEnvSchema = z.object({
  SCRAPER_MAX_PAGES: z.coerce.number().int().min(1).max(PDF_MAX_PAGES).default(PDF_MAX_PAGES),
  SCRAPER_DELAY_MS: z.coerce.number().int().min(PDF_MIN_DELAY_MS).default(1200),
})

export const parseScraperEnv = (env: NodeJS.ProcessEnv) => ScraperEnvSchema.parse(env)

const env = parseScraperEnv(process.env)

export const config = {
  baseUrl: 'https://umapenca.com/loja/',
  maxPages: env.SCRAPER_MAX_PAGES,
  delayMs: env.SCRAPER_DELAY_MS,
  timeoutMs: 10_000,
  retries: 2,
  userAgent: 'chico-rei-store-teste-tecnico (scraper de estudo; 5 paginas, 1 req/s)',
}

export const pageUrl = (page: number) =>
  page === 1 ? config.baseUrl : `${config.baseUrl}?page=${page}`

/** Limites do PDF: no máximo 5 páginas e pelo menos 1 s entre requisições. */

const PDF_MAX_PAGES = 5
const PDF_MIN_DELAY_MS = 1000

const numberFromEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export const config = {
  baseUrl: 'https://umapenca.com/loja/',

  // O .env pode diminuir as páginas ou aumentar o intervalo, nunca furar os limites.

  maxPages: Math.min(numberFromEnv('SCRAPER_MAX_PAGES', PDF_MAX_PAGES), PDF_MAX_PAGES),
  delayMs: Math.max(numberFromEnv('SCRAPER_DELAY_MS', 1200), PDF_MIN_DELAY_MS),
  timeoutMs: 10_000,
  retries: 2,
  userAgent: 'chico-rei-store-teste-tecnico (scraper de estudo; 5 paginas, 1 req/s)',
}

export const pageUrl = (page: number) =>
  page === 1 ? config.baseUrl : `${config.baseUrl}?page=${page}`

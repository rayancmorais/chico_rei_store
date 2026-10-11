import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectProducts } from './collect'
import { loadConfig, pageUrl } from './config'
import { fetchHtml, sleep } from './http'
import { pluralize } from './pluralize'

const SEED_PATH = fileURLToPath(new URL('../../../data/seed.json', import.meta.url))

async function main() {
  // Validado aqui, e não ao importar o config: assim um .env inválido cai no catch lá embaixo e
  // sai como uma linha de erro, sem stack trace.
  const config = loadConfig(process.env)
  const pages = pluralize(config.maxPages, 'página', 'páginas')
  console.log(`Coletando até ${pages}, ${config.delayMs} ms entre requisições`)

  const { pagesCollected, products } = await collectProducts({
    maxPages: config.maxPages,
    delayMs: config.delayMs,
    pageUrl,
    wait: sleep,
    fetchPage: (url) => fetchHtml(url, config),
    log: (message) => console.log(`  ${message}`),
  })

  const seed = {
    source: config.baseUrl,
    collectedAt: new Date().toISOString(),
    pages: pagesCollected,
    products,
  }

  await mkdir(dirname(SEED_PATH), { recursive: true })
  await writeFile(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`)
  const collected = `${pluralize(products.length, 'produto', 'produtos')} de ${pluralize(pagesCollected, 'página', 'páginas')}`
  console.log(`Seed gravado: ${collected} em data/seed.json`)
}

main().catch((error: unknown) => {
  console.error('Falha na coleta:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})

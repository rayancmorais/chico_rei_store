import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectProducts } from './collect'
import { config, pageUrl } from './config'
import { fetchHtml, sleep } from './http'

const SEED_PATH = fileURLToPath(new URL('../../../data/seed.json', import.meta.url))

async function main() {
  console.log(`Coletando até ${config.maxPages} páginas, ${config.delayMs} ms entre requisições`)

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
  console.log(
    `Seed gravado: ${products.length} produtos de ${pagesCollected} páginas em data/seed.json`,
  )
}

main().catch((error: unknown) => {
  console.error('Falha na coleta:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})

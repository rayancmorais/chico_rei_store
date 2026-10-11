import type { RawProduct } from '@chico_rei_store/shared'
import { extractInitialData } from './parse'
import { pluralize } from './pluralize'
import { SourcePageSchema } from './source-schema'
import { toRawProducts } from './to-raw-products'

interface CollectOptions {
  maxPages: number
  delayMs: number
  pageUrl: (page: number) => string
  fetchPage: (url: string) => Promise<string>
  wait: (ms: number) => Promise<void>
  log?: (message: string) => void
}

export interface CollectResult {
  pagesCollected: number
  products: RawProduct[]
}

/**
 * Coleta as páginas em sequência — nunca em paralelo — com intervalo fixo entre elas.
 * Rede e espera chegam por parâmetro, então os testes rodam sem acessar o site.
 */
export async function collectProducts(options: CollectOptions): Promise<CollectResult> {
  const { maxPages, delayMs, pageUrl, fetchPage, wait, log = () => {} } = options
  const byId = new Map<string, RawProduct>()
  let pagesCollected = 0

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) await wait(delayMs)

    const url = pageUrl(page)
    const data = SourcePageSchema.parse(extractInitialData(await fetchPage(url)))
    const products = toRawProducts(data)
    pagesCollected++

    // Um produto pode aparecer em duas páginas se o catálogo mudar durante a coleta.
    for (const product of products) byId.set(product.sourceId, product)
    log(`página ${page}: ${pluralize(products.length, 'produto', 'produtos')} (${url})`)

    if (products.length === 0 || data.products.current_page >= data.products.total_pages) break
  }

  return { pagesCollected, products: [...byId.values()] }
}

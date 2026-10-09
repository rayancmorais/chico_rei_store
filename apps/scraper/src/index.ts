const BASE_URL = 'https://umapenca.com/loja/'
const MAX_PAGES = Math.min(Number(process.env.SCRAPER_MAX_PAGES ?? 5), 5)
const DELAY_MS = Math.max(Number(process.env.SCRAPER_DELAY_MS ?? 1200), 1000)

const pageUrl = (page: number) => (page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`)

console.log(`Scraper pronto: até ${MAX_PAGES} páginas, ${DELAY_MS} ms entre requisições`)
console.log(`Primeira página: ${pageUrl(1)}`)

// Laço final (sequencial, nunca Promise.all):
// for (let page = 1; page <= MAX_PAGES; page++) {
//   if (page > 1) await sleep(DELAY_MS)
//   const html = await fetchHtml(pageUrl(page))
//   const data = SourcePageSchema.parse(extractInitialData(html))
//   collected.push(...toRawProducts(data))
//   if (data.products.current_page >= data.products.total_pages) break
// }

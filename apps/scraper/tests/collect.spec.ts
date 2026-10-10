import { collectProducts } from '../src/collect'
import { loadFixture } from './load-fixture'

const pages: Record<string, string> = {
  'https://loja.test/?page=1': loadFixture('loja-page-1.html'),
  'https://loja.test/?page=2': loadFixture('loja-page-2.html'),
}

function setup(maxPages: number) {
  const events: string[] = []
  const fetchPage = vi.fn(async (url: string) => {
    events.push(`fetch ${url}`)
    const page = pages[url]
    if (!page) throw new Error(`fixture ausente para ${url}`)
    return page
  })
  const wait = vi.fn(async (ms: number) => {
    events.push(`wait ${ms}`)
  })
  const run = () =>
    collectProducts({
      maxPages,
      delayMs: 1200,
      pageUrl: (page) => `https://loja.test/?page=${page}`,
      fetchPage,
      wait,
    })
  return { events, fetchPage, run }
}

describe('collectProducts', () => {
  it('coleta em sequência, esperando o intervalo entre as páginas', async () => {
    const { events, run } = setup(2)

    await run()

    expect(events).toEqual([
      'fetch https://loja.test/?page=1',
      'wait 1200',
      'fetch https://loja.test/?page=2',
    ])
  })

  it('respeita o limite de páginas', async () => {
    const { fetchPage, run } = setup(1)

    const result = await run()

    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(result.pagesCollected).toBe(1)
  })

  it('junta os produtos das páginas sem repetir ids', async () => {
    const { run } = setup(2)

    const { products } = await run()

    expect(products).toHaveLength(72)
    expect(new Set(products.map((p) => p.sourceId)).size).toBe(72)
  })
})

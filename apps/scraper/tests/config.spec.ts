import { parseScraperEnv } from '../src/config'

describe('parseScraperEnv', () => {
  it('usa os limites do PDF quando o .env não define nada', () => {
    expect(parseScraperEnv({})).toEqual({ SCRAPER_MAX_PAGES: 5, SCRAPER_DELAY_MS: 1200 })
  })

  it('aceita valores dentro dos limites', () => {
    expect(parseScraperEnv({ SCRAPER_MAX_PAGES: '3' }).SCRAPER_MAX_PAGES).toBe(3)
  })

  it.each([
    [{ SCRAPER_MAX_PAGES: 'abc' }],
    [{ SCRAPER_MAX_PAGES: '9' }],
    [{ SCRAPER_DELAY_MS: '500' }],
  ])('recusa configuração fora dos limites do PDF: %o', (env) => {
    expect(() => parseScraperEnv(env)).toThrow()
  })
})

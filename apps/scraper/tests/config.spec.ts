import { parseScraperEnv } from '../src/config'

describe('parseScraperEnv', () => {
  it('usa os limites da coleta quando o .env não define nada', () => {
    expect(parseScraperEnv({})).toEqual({ SCRAPER_MAX_PAGES: 5, SCRAPER_DELAY_MS: 5000 })
  })

  it('aceita valores dentro dos limites', () => {
    expect(parseScraperEnv({ SCRAPER_MAX_PAGES: '3' }).SCRAPER_MAX_PAGES).toBe(3)
    expect(parseScraperEnv({ SCRAPER_DELAY_MS: '5000' }).SCRAPER_DELAY_MS).toBe(5000)
  })

  it.each([
    [{ SCRAPER_MAX_PAGES: 'abc' }],
    [{ SCRAPER_MAX_PAGES: '9' }],
    [{ SCRAPER_DELAY_MS: '500' }],
    // Passa no mínimo de 1 s do PDF, mas não no Crawl-delay de 5 s do robots.txt.
    [{ SCRAPER_DELAY_MS: '1200' }],
    [{ SCRAPER_DELAY_MS: '4999' }],
  ])('recusa configuração fora dos limites da coleta: %o', (env) => {
    expect(() => parseScraperEnv(env)).toThrow()
  })

  describe('mensagem de erro', () => {
    const errorMessage = (env: NodeJS.ProcessEnv) => {
      try {
        parseScraperEnv(env)
      } catch (error) {
        return (error as Error).message
      }
      throw new Error('esperava que a configuração fosse recusada')
    }

    // É essa mensagem que o `npm run scrape` imprime depois de "Falha na coleta:".
    it('diz o campo e o limite numa frase legível, sem o dump do Zod', () => {
      const message = errorMessage({ SCRAPER_DELAY_MS: '1200' })
      expect(message).toBe('SCRAPER_DELAY_MS deve ser pelo menos 5000')
      expect(message).not.toMatch(/ZodError|"code"|\n\s+at /)
    })

    it('mostra um campo por linha quando há mais de um errado', () => {
      expect(errorMessage({ SCRAPER_MAX_PAGES: 'abc', SCRAPER_DELAY_MS: '1200' })).toBe(
        'SCRAPER_MAX_PAGES deve ser um número\nSCRAPER_DELAY_MS deve ser pelo menos 5000',
      )
    })
  })
})

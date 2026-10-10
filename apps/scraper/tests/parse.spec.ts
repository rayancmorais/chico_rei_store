import { extractInitialData, slugify } from '../src/parse'
import { SourcePageSchema } from '../src/source-schema'
import { loadFixture } from './load-fixture'

describe('extractInitialData', () => {
  it.each([
    ['loja-page-1.html', 1],
    ['loja-page-2.html', 2],
  ])('extrai a página real %s, mesmo com JavaScript depois do JSON', (file, page) => {
    const data = SourcePageSchema.parse(extractInitialData(loadFixture(file)))

    expect(data.products.current_page).toBe(page)
    expect(data.products.hits).toHaveLength(36)
  })

  it('ignora chaves e aspas dentro de strings', () => {
    const html =
      '<script>window.vueInitialData = {"name":"Camiseta { } \\"Exu\\"","nested":{"ok":true}};' +
      'var listener = function () { return {} };</script>'

    expect(extractInitialData(html)).toEqual({ name: 'Camiseta { } "Exu"', nested: { ok: true } })
  })

  it('falha com mensagem clara quando a página não tem o JSON', () => {
    expect(() => extractInitialData('<html></html>')).toThrow('vueInitialData não encontrado')
  })
})

describe('slugify', () => {
  it('remove acentos e troca espaços por hífen', () => {
    expect(slugify('Cinza Mescla')).toBe('cinza-mescla')
    expect(slugify('Lilás')).toBe('lilas')
  })
})

import { ProductSchema, type RawProduct } from '@chico_rei_store/shared'
import { toProduct } from '../src/adapters/product-adapter'

const raw: RawProduct = {
  sourceId: '21404',
  name: 'Camiseta Tridente',
  url: 'https://umapenca.com/produto-21404.html',
  type: { id: 'camiseta', label: 'Camiseta' },
  priceCents: 6690,
  originalPriceCents: null,
  image: 'https://umapenca.imgix.net/21404/capa.png',
  colors: [{ id: 'preto', name: 'Preto', hex: '#000000' }],
  isClothing: true,
  models: ['Camiseta Regular'],
}

describe('toProduct', () => {
  it('gera um produto válido pelo contrato compartilhado', () => {
    expect(() => ProductSchema.parse(toProduct(raw))).not.toThrow()
  })

  it('usa o id da origem e preserva os dados que vieram da fonte', () => {
    const product = toProduct(raw)

    expect(product).toMatchObject({
      id: '21404',
      type: raw.type,
      priceCents: 6690,
      colors: raw.colors,
      sourceUrl: raw.url,
    })
  })
})

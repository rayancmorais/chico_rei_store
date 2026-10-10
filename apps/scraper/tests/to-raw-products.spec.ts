import { RawProductSchema } from '@chico_rei_store/shared'
import { extractInitialData } from '../src/parse'
import { SourcePageSchema, type SourceProduct } from '../src/source-schema'
import { toRawProduct, toRawProducts } from '../src/to-raw-products'
import { loadFixture } from './load-fixture'

const loadPage = (file: string) =>
  toRawProducts(SourcePageSchema.parse(extractInitialData(loadFixture(file))))

function sourceProduct(overrides: Partial<SourceProduct> = {}): SourceProduct {
  return {
    id: 1,
    name: 'Camiseta Teste',
    full_link: 'https://umapenca.com/produto-1.html',
    price: 72.9,
    price_old: 0,
    img_cover: 'https://umapenca.imgix.net/1/capa.png',
    is_clothing: true,
    type: { url: 'camiseta', name: 'Camiseta' },
    fabrics: [],
    product_color: null,
    models: [{ name: 'Camiseta Regular' }],
    ...overrides,
  }
}

describe('toRawProducts com páginas reais', () => {
  it('gera produtos válidos e com ids únicos', () => {
    const products = loadPage('loja-page-1.html')

    products.forEach((product) => RawProductSchema.parse(product))
    expect(new Set(products.map((p) => p.sourceId)).size).toBe(products.length)
  })

  it('páginas diferentes trazem produtos diferentes', () => {
    const page1 = new Set(loadPage('loja-page-1.html').map((p) => p.sourceId))
    const page2 = loadPage('loja-page-2.html').map((p) => p.sourceId)

    expect(page2.some((id) => page1.has(id))).toBe(false)
  })
})

describe('toRawProduct', () => {
  it('converte o preço para centavos sem erro de ponto flutuante', () => {
    expect(toRawProduct(sourceProduct({ price: 72.9 })).priceCents).toBe(7290)
  })

  it('só define preço original quando ele é maior que o atual', () => {
    expect(toRawProduct(sourceProduct({ price: 50, price_old: 0 })).originalPriceCents).toBeNull()
    expect(toRawProduct(sourceProduct({ price: 50, price_old: 70 })).originalPriceCents).toBe(7000)
  })

  it('remove cores repetidas entre tecidos', () => {
    const product = sourceProduct({
      fabrics: [
        { product_color_name: 'Preto', product_color_hexa: '#000000' },
        { product_color_name: 'Preto', product_color_hexa: '#000000' },
        { product_color_name: 'Cinza Mescla', product_color_hexa: '#868585' },
      ],
    })

    expect(toRawProduct(product).colors.map((c) => c.id)).toEqual(['preto', 'cinza-mescla'])
  })

  it('usa a cor do produto quando não há tecidos', () => {
    const product = sourceProduct({ product_color: { name: 'Multicolorido', hexa: '#5E5B5D' } })

    expect(toRawProduct(product).colors).toEqual([
      { id: 'multicolorido', name: 'Multicolorido', hex: '#5e5b5d' },
    ])
  })

  it('fica sem cores quando a fonte não traz nenhuma', () => {
    expect(toRawProduct(sourceProduct()).colors).toEqual([])
  })
})

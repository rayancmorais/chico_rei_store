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
    img_cover_model: 34,
    images_by_fabric: [],
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
        { color_id: 8, product_color_name: 'Preto', product_color_hexa: '#000000' },
        { color_id: 8, product_color_name: 'Preto', product_color_hexa: '#000000' },
        { color_id: 3, product_color_name: 'Cinza Mescla', product_color_hexa: '#868585' },
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

describe('toRawProduct: foto de cada cor', () => {
  const photo = (colorId: number, modelId: number | null, file: string) => ({
    color_id: colorId,
    product_model_id: modelId,
    url: `https://umapenca.imgix.net/1/${file}`,
  })
  const fabrics = [
    { color_id: 8, product_color_name: 'Preto', product_color_hexa: '#000000' },
    { color_id: 2, product_color_name: 'Branco', product_color_hexa: '#ffffff' },
    { color_id: 5, product_color_name: 'Verde', product_color_hexa: '#007a33' },
  ]

  it('usa a foto do mesmo modelo da capa e ignora a amostra de tecido', () => {
    const product = sourceProduct({
      fabrics,
      img_cover_model: 34,
      images_by_fabric: [
        photo(8, null, 'amostra-preto.jpg'),
        photo(8, 31, 'babylook-preto.png'),
        photo(8, 34, 'regular-preto.png'),
        photo(2, 34, 'regular-branco.png'),
      ],
    })

    expect(toRawProduct(product).imagesByColor).toEqual({
      preto: 'https://umapenca.imgix.net/1/regular-preto.png',
      branco: 'https://umapenca.imgix.net/1/regular-branco.png',
    })
  })

  it('cai para outro modelo quando o da capa não tem a cor, e cor sem foto fica de fora', () => {
    const product = sourceProduct({
      fabrics,
      img_cover_model: 34,
      images_by_fabric: [photo(2, 31, 'babylook-branco.png'), photo(5, null, 'amostra-verde.jpg')],
    })

    expect(toRawProduct(product).imagesByColor).toEqual({
      branco: 'https://umapenca.imgix.net/1/babylook-branco.png',
    })
  })

  it('numa página real, cada cor da camiseta tem a própria foto', () => {
    const tropicalia = loadPage('loja-page-1.html').find((p) => p.sourceId === '431436')!

    expect(Object.keys(tropicalia.imagesByColor ?? {})).toEqual(tropicalia.colors.map((c) => c.id))
    expect(new Set(Object.values(tropicalia.imagesByColor ?? {})).size).toBe(7)
  })
})

import type { RawProduct } from '@chico_rei_store/shared'
import { enrichDescription, enrichSizes, fnv1a } from '../src/adapters/enrichment'

function rawProduct(overrides: Partial<RawProduct> = {}): RawProduct {
  return {
    sourceId: '21404',
    name: 'Camiseta Tridente',
    url: 'https://umapenca.com/produto-21404.html',
    type: { id: 'camiseta', label: 'Camiseta' },
    priceCents: 6690,
    originalPriceCents: null,
    image: 'https://umapenca.imgix.net/21404/capa.png',
    colors: [
      { id: 'preto', name: 'Preto', hex: '#000000' },
      { id: 'branco', name: 'Branco', hex: '#ffffff' },
    ],
    isClothing: true,
    models: ['Camiseta Regular', 'Camiseta Babylook'],
    ...overrides,
  }
}

describe('fnv1a', () => {
  it('gera o valor de referência do algoritmo', () => {
    expect(fnv1a('')).toBe(0x811c9dc5)
    expect(fnv1a('a')).toBe(0xe40c292c)
  })

  it('é determinístico', () => {
    expect(fnv1a('21404')).toBe(fnv1a('21404'))
  })
})

describe('enrichSizes', () => {
  it('é determinístico: o mesmo produto recebe sempre os mesmos tamanhos', () => {
    expect(enrichSizes(rawProduct())).toEqual(enrichSizes(rawProduct()))
  })

  it('roupa adulta vai sempre de P a GG e se estende até 2GG, 3GG ou 4GG', () => {
    const grids = Array.from({ length: 50 }, (_, i) =>
      enrichSizes(rawProduct({ sourceId: String(i) })),
    )

    for (const sizes of grids) expect(sizes.slice(0, 5)).toEqual(['P', 'M', 'G', 'GG', '2GG'])
    expect(new Set(grids.map((sizes) => sizes.at(-1)))).toEqual(new Set(['2GG', '3GG', '4GG']))
  })

  it('roupa infantil recebe a grade infantil da loja', () => {
    const product = rawProduct({ type: { id: 'camiseta-infantil', label: 'Camiseta Infantil' } })

    expect(enrichSizes(product)).toEqual(['2', '4', '6', '8', '10', '12', '14'])
  })

  it('o que não é roupa fica sem tamanho', () => {
    expect(enrichSizes(rawProduct({ isClothing: false }))).toEqual([])
  })
})

describe('enrichDescription', () => {
  it('usa nome, modelos e cores reais do produto', () => {
    expect(enrichDescription(rawProduct())).toBe(
      'Camiseta Tridente, estampa produzida sob demanda pela Uma Penca. ' +
        'Disponível nos modelos Camiseta Regular e Camiseta Babylook, nas cores Preto e Branco.',
    )
  })

  it('usa o singular com um modelo e uma cor só', () => {
    const product = rawProduct({
      name: 'Camiseta Infantil Bicho',
      models: ['Infantil'],
      colors: [{ id: 'amarelo', name: 'Amarelo', hex: '#eab939' }],
    })

    expect(enrichDescription(product)).toBe(
      'Camiseta Infantil Bicho, estampa produzida sob demanda pela Uma Penca. ' +
        'Disponível no modelo Infantil, na cor Amarelo.',
    )
  })

  it('omite o que não existe', () => {
    const ecobag = rawProduct({
      name: 'Ecobag Semana Cheia',
      models: [],
      colors: [{ id: 'multicolorido', name: 'Multicolorido', hex: '#5e5b5d' }],
    })
    const noDetails = rawProduct({ name: 'Bottons Pop', models: [], colors: [] })

    expect(enrichDescription(ecobag)).toBe(
      'Ecobag Semana Cheia, estampa produzida sob demanda pela Uma Penca. Disponível na cor Multicolorido.',
    )
    expect(enrichDescription(noDetails)).toBe(
      'Bottons Pop, estampa produzida sob demanda pela Uma Penca.',
    )
  })
})

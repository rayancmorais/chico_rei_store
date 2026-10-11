import type { Product } from '@chico_rei_store/shared'

const color = (id: string, name: string) => ({ id, name, hex: '#000000' })
export const preto = color('preto', 'Preto')
export const branco = color('branco', 'Branco')
export const vermelho = color('vermelho', 'Vermelho')

export function product(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Camiseta Teste',
    type: { id: 'camiseta', label: 'Camiseta' },
    priceCents: 6690,
    originalPriceCents: null,
    image: 'https://umapenca.imgix.net/1/capa.png',
    description: 'Camiseta Teste, estampa produzida sob demanda pela Uma Penca.',
    colors: [preto],
    sizes: ['P', 'M', 'G', 'GG', '2GG'],
    models: ['Camiseta Regular'],
    sourceUrl: 'https://umapenca.com/produto-1.html',
    enriched: { sizes: true, description: true },
    ...overrides,
  }
}

/** Catálogo pequeno com combinações conhecidas de tipo, cor e preço. */
export const catalog: Product[] = [
  product({ id: '1', priceCents: 6690, colors: [preto, branco] }),
  product({ id: '2', priceCents: 5090, colors: [vermelho] }),
  product({
    id: '3',
    priceCents: 13540,
    type: { id: 'moletom', label: 'Moletom' },
    colors: [preto],
  }),
  product({
    id: '4',
    priceCents: 4990,
    type: { id: 'caneca', label: 'Caneca' },
    colors: [branco],
    sizes: [],
  }),
]

import type { RawProduct } from '@chico_rei_store/shared'

/** Grades reais da loja, vindas de `filters.sizes_adult` e `filters.sizes_child` da vitrine. */

const CHILD_SIZES = ['2', '4', '6', '8', '10', '12', '14']
const ADULT_BASE_SIZES = ['P', 'M', 'G', 'GG']
const ADULT_EXTRA_SIZES = ['2GG', '3GG', '4GG']

/**
 * Hash FNV-1a de 32 bits. Determinístico: o mesmo id gera sempre o mesmo número,
 * então o produto recebe os mesmos tamanhos em qualquer máquina e a cada reinício
 * (com Math.random, um carrinho salvo poderia perder o tamanho escolhido).
 */

export function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (const char of input) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

const isChildClothing = (product: RawProduct) => product.type.id.includes('infantil')

export function enrichSizes(product: RawProduct): string[] {
  if (!product.isClothing) return []
  if (isChildClothing(product)) return [...CHILD_SIZES]

  const extraCount = 1 + (fnv1a(product.sourceId) % ADULT_EXTRA_SIZES.length)
  return [...ADULT_BASE_SIZES, ...ADULT_EXTRA_SIZES.slice(0, extraCount)]
}

const joinPtBr = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

/** "no modelo Regular" ou "nos modelos Regular e Babylook". */
const listWithArticle = (singular: string, plural: string, items: string[]) =>
  items.length === 1 ? `${singular} ${items[0]}` : `${plural} ${joinPtBr.format(items)}`

export function enrichDescription(product: RawProduct): string {
  const colorNames = product.colors.map((color) => color.name)
  const availability = [
    product.models.length ? listWithArticle('no modelo', 'nos modelos', product.models) : '',
    colorNames.length ? listWithArticle('na cor', 'nas cores', colorNames) : '',
  ].filter(Boolean)

  const intro = `${product.name}, estampa produzida sob demanda pela Uma Penca.`
  return availability.length ? `${intro} Disponível ${availability.join(', ')}.` : intro
}

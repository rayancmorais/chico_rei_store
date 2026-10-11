import type { ProductSummary } from '@chico_rei_store/shared'

type HeroCandidate = Pick<ProductSummary, 'name' | 'type'>

// Modelos "Personalizada" são para o cliente aplicar a própria arte: não mostram o que a vitrine
// tem de autoral e contradiriam o selo "Arte autoral" do quadro principal.
const isCustomizable = (product: HeroCandidate) => /personalizad/i.test(product.name)

/** Um produto de cada tipo enquanto houver variedade; só repete tipo quando faltar. */
export function pickHeroProducts<T extends HeroCandidate>(
  products: readonly T[],
  count: number,
): T[] {
  const firstOfEachType: T[] = []
  const repeatedTypes: T[] = []
  const seenTypes = new Set<string>()

  for (const product of products) {
    if (isCustomizable(product)) continue
    if (seenTypes.has(product.type.id)) {
      repeatedTypes.push(product)
    } else {
      seenTypes.add(product.type.id)
      firstOfEachType.push(product)
    }
  }

  return [...firstOfEachType, ...repeatedTypes].slice(0, count)
}

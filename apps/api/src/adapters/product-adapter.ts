import type { Product, RawProduct } from '@chico_rei_store/shared'
import { enrichDescription, enrichSizes } from './enrichment'

export function toProduct(raw: RawProduct): Product {
  return {
    id: raw.sourceId,
    name: raw.name,
    type: raw.type,
    priceCents: raw.priceCents,
    originalPriceCents: raw.originalPriceCents,
    image: raw.image,
    description: enrichDescription(raw),
    colors: raw.colors,
    sizes: enrichSizes(raw),
    models: raw.models,
    sourceUrl: raw.url,

    // A listagem da fonte nunca traz tamanhos nem descrição, os dois são sempre gerados.

    enriched: { sizes: true, description: true },
  }
}

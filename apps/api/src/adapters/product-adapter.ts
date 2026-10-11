import type { Product, RawProduct } from '@chico_rei_store/shared'
import { enrichColors, enrichDescription, enrichSizes } from './enrichment'

export function toProduct(raw: RawProduct): Product {
  return {
    id: raw.sourceId,
    name: raw.name,
    type: raw.type,
    priceCents: raw.priceCents,
    originalPriceCents: raw.originalPriceCents,
    image: raw.image,
    imagesByColor: raw.imagesByColor ?? {},
    description: enrichDescription(raw),
    colors: enrichColors(raw),
    sizes: enrichSizes(raw),
    models: raw.models,
    sourceUrl: raw.url,

    // A listagem da fonte nunca traz tamanhos nem descrição; a cor só falta em alguns produtos.
    enriched: { colors: raw.colors.length === 0, sizes: true, description: true },
  }
}

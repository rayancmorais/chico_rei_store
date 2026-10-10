import type { Color, RawProduct } from '@chico_rei_store/shared'
import { slugify } from './parse'
import type { SourcePage, SourceProduct } from './source-schema'

/** centavos inteiros para evitar erro de ponto flutuante (ex.: 72.9 * 100 = 7290.000000000001). */
const toCents = (value: number) => Math.round(value * 100)

const toColor = (name: string, hex: string): Color => ({
  id: slugify(name),
  name,
  hex: hex.toLowerCase(),
})

/**
 * as cores do produto, sem repetição: tecidos diferentes podem ter a mesma cor final.
 * sem tecidos (ecobag, caderno...), usa a cor única do produto, quando existir.
 */
function extractColors(product: SourceProduct): Color[] {
  const candidates = product.fabrics.length
    ? product.fabrics.map((f) => toColor(f.product_color_name, f.product_color_hexa))
    : product.product_color
      ? [toColor(product.product_color.name, product.product_color.hexa)]
      : []

  const unique = new Map(candidates.map((color) => [color.id, color]))
  return [...unique.values()]
}

export function toRawProduct(product: SourceProduct): RawProduct {
  return {
    sourceId: String(product.id),
    name: product.name.trim(),
    url: product.full_link,
    type: { id: product.type.url, label: product.type.name },
    priceCents: toCents(product.price),
    originalPriceCents: product.price_old > product.price ? toCents(product.price_old) : null,
    image: product.img_cover,
    colors: extractColors(product),
    isClothing: product.is_clothing,
    models: product.models.map((m) => m.name),
  }
}

export const toRawProducts = (page: SourcePage): RawProduct[] =>
  page.products.hits.map(toRawProduct)

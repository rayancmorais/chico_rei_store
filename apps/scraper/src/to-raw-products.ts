import type { Color, RawProduct } from '@chico_rei_store/shared'
import { slugify } from './slugify'
import type { SourcePage, SourceProduct } from './source-schema'

/** Centavos inteiros para evitar erro de ponto flutuante (ex.: 72.9 * 100 = 7290.000000000001). */
const toCents = (value: number) => Math.round(value * 100)

const toColor = (name: string, hex: string): Color => ({
  id: slugify(name),
  name,
  hex: hex.toLowerCase(),
})

const fallbackColorOf = ({ product_color }: SourceProduct): Color[] =>
  product_color ? [toColor(product_color.name, product_color.hexa)] : []

// Tecidos diferentes podem ter a mesma cor final.
function uniqueColorsOf(product: SourceProduct): Color[] {
  const colors = product.fabrics.length
    ? product.fabrics.map((fabric) => toColor(fabric.product_color_name, fabric.product_color_hexa))
    : fallbackColorOf(product)

  return [...new Map(colors.map((color) => [color.id, color])).values()]
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
    colors: uniqueColorsOf(product),
    isClothing: product.is_clothing,
    models: product.models.map((model) => model.name),
  }
}

export const toRawProducts = (page: SourcePage): RawProduct[] =>
  page.products.hits.map(toRawProduct)

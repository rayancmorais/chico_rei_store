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

// A vitrine traz uma foto por tecido e modelo. Fica a do mesmo modelo da capa, para a peça manter o
// enquadramento ao trocar de cor; outro modelo só entra se esse não tiver a cor.
function imagesByColorOf(product: SourceProduct): Record<string, string> {
  const colorIdOf = new Map(
    product.fabrics.map((fabric) => [fabric.color_id, slugify(fabric.product_color_name)]),
  )
  const isCoverModel = (modelId: number | null) => modelId === product.img_cover_model
  const photos = product.images_by_fabric
    .filter((image) => image.product_model_id !== null)
    .sort(
      (a, b) => Number(isCoverModel(b.product_model_id)) - Number(isCoverModel(a.product_model_id)),
    )

  const images: Record<string, string> = {}
  for (const photo of photos) {
    const colorId = colorIdOf.get(photo.color_id)
    if (colorId && !(colorId in images)) images[colorId] = photo.url
  }
  return images
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
    imagesByColor: imagesByColorOf(product),
    colors: uniqueColorsOf(product),
    isClothing: product.is_clothing,
    models: product.models.map((model) => model.name),
  }
}

export const toRawProducts = (page: SourcePage): RawProduct[] =>
  page.products.hits.map(toRawProduct)

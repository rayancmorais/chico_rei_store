import { z } from 'zod'

/**
 * Formato do JSON que a vitrine da Uma Penca injeta em `window.vueInitialData`.
 * Só declaramos os campos que usamos: o z.object ignora os demais.
 */
const SourceColorSchema = z.object({
  name: z.string(),
  hexa: z.string(),
})

const SourceFabricSchema = z.object({
  color_id: z.number().int(),
  product_color_name: z.string(),
  product_color_hexa: z.string(),
})

/** Foto da peça num tecido e modelo. Sem modelo, é só a amostra do tecido. */
const SourceFabricImageSchema = z.object({
  color_id: z.number().int(),
  product_model_id: z.number().int().nullable(),
  url: z.string().url(),
})

export const SourceProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  full_link: z.string().url(),
  price: z.number().nonnegative(),
  price_old: z.number().nonnegative(),
  img_cover: z.string().url(),
  img_cover_model: z.number().int().nullable(),
  images_by_fabric: z
    .array(SourceFabricImageSchema)
    .nullish()
    .transform((images) => images ?? []),
  is_clothing: z.boolean(),
  type: z.object({
    url: z.string(),
    name: z.string(),
  }),
  fabrics: z.array(SourceFabricSchema),
  product_color: SourceColorSchema.nullable(),
  models: z.array(z.object({ name: z.string() })),
})

export const SourcePageSchema = z.object({
  products: z.object({
    current_page: z.number().int(),
    total_pages: z.number().int(),
    hits: z.array(SourceProductSchema),
  }),
})

export type SourceProduct = z.infer<typeof SourceProductSchema>
export type SourcePage = z.infer<typeof SourcePageSchema>

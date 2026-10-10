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
  product_color_name: z.string(),
  product_color_hexa: z.string(),
})

export const SourceProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  full_link: z.string().url(),
  price: z.number().nonnegative(),
  price_old: z.number().nonnegative(),
  img_cover: z.string().url(),
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

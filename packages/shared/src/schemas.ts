import { z } from 'zod'

export const ColorSchema = z.object({ id: z.string(), name: z.string(), hex: z.string() })

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  priceCents: z.number().int().nonnegative(),
  image: z.string().url(),
  description: z.string(),
  colors: z.array(ColorSchema),
  sizes: z.array(z.string()),
})

export const ProductSummarySchema = ProductSchema.pick({
  id: true,
  name: true,
  type: true,
  priceCents: true,
  image: true,
  colors: true,
})

const csv = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  )

export const ProductQuerySchema = z.object({
  type: csv,
  color: csv,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
})

/**
 * produto como sai do scraper e fica gravado no seed. só o que a fonte traz.
 * tamanhos e descrição não existem aqui. a API vai enriquecer eles no adapter.
 */

export const RawProductSchema = z.object({
  sourceId: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.object({ id: z.string(), label: z.string() }),
  priceCents: z.number().int().nonnegative(),
  originalPriceCents: z.number().int().nonnegative().nullable(),
  image: z.string().url(),
  colors: z.array(ColorSchema),
  isClothing: z.boolean(),
  models: z.array(z.string()),
})

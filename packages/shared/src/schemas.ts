import { z } from 'zod'

export const ColorSchema = z.object({ id: z.string(), name: z.string(), hex: z.string() })

/** `id` vai na URL dos filtros; `label` é o nome exibido ("ima" não vira "Kit de Imãs"). */
export const ProductTypeSchema = z.object({ id: z.string(), label: z.string() })

/**
 * Produto como sai do scraper e fica gravado no seed: só o que a fonte traz.
 * Tamanhos e descrição não existem aqui; a API os enriquece no adapter.
 */
export const RawProductSchema = z.object({
  sourceId: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: ProductTypeSchema,
  priceCents: z.number().int().nonnegative(),
  originalPriceCents: z.number().int().nonnegative().nullable(),
  image: z.string().url(),
  /** Foto real da peça em cada cor, pelo id da cor. Cor sem foto fica de fora e usa a `image`. */
  imagesByColor: z.record(z.string(), z.string().url()).optional(),
  colors: z.array(ColorSchema),
  isClothing: z.boolean(),
  models: z.array(z.string()),
})

export const SeedSchema = z.object({
  source: z.string().url(),
  collectedAt: z.string().datetime(),
  pages: z.number().int().positive(),
  products: z.array(RawProductSchema),
})

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ProductTypeSchema,
  priceCents: z.number().int().nonnegative(),
  originalPriceCents: z.number().int().nonnegative().nullable(),
  image: z.string().url(),
  imagesByColor: z.record(z.string(), z.string().url()),
  description: z.string(),
  colors: z.array(ColorSchema),

  /** Vazio quando o produto não tem tamanho (caneca, ecobag...): o seletor não aparece. */
  sizes: z.array(z.string()),
  models: z.array(z.string()),
  sourceUrl: z.string().url(),

  /** O que foi gerado pela API, e não veio da fonte. */
  enriched: z.object({ colors: z.boolean(), sizes: z.boolean(), description: z.boolean() }),
})

/** Só o que o card da listagem usa: resposta da listagem mais leve. */
export const ProductSummarySchema = ProductSchema.pick({
  id: true,
  name: true,
  type: true,
  priceCents: true,
  originalPriceCents: true,
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
  sort: z.enum(['relevance', 'price_asc', 'price_desc']).default('relevance'),
})

export const ProductListResponseSchema = z.object({
  data: z.array(ProductSummarySchema),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
})

const count = z.number().int()

/** Cada opção traz quantos produtos ela retorna junto com os outros filtros ativos. */
export const FiltersResponseSchema = z.object({
  types: z.array(ProductTypeSchema.extend({ count })),
  colors: z.array(ColorSchema.extend({ count })),
})

export const ApiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

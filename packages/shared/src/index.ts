import type { z } from 'zod'
import type {
  ColorSchema,
  ProductSchema,
  ProductSummarySchema,
  ProductQuerySchema,
  RawProductSchema,
} from './schemas'

export * from './schemas'
export type Color = z.infer<typeof ColorSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductSummary = z.infer<typeof ProductSummarySchema>
export type ProductQuery = z.infer<typeof ProductQuerySchema>
export type RawProduct = z.infer<typeof RawProductSchema>

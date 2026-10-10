import type { z } from 'zod'
import type {
  ColorSchema,
  ProductQuerySchema,
  ProductSchema,
  ProductSummarySchema,
  ProductTypeSchema,
  RawProductSchema,
  SeedSchema,
} from './schemas'

export * from './schemas'
export type Color = z.infer<typeof ColorSchema>
export type ProductType = z.infer<typeof ProductTypeSchema>
export type RawProduct = z.infer<typeof RawProductSchema>
export type Seed = z.infer<typeof SeedSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductSummary = z.infer<typeof ProductSummarySchema>
export type ProductQuery = z.infer<typeof ProductQuerySchema>

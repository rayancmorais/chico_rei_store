import { SeedSchema, type Product } from '@chico_rei_store/shared'
import { toProduct } from '../adapters/product-adapter'

export interface ProductRepository {
  all(): readonly Product[]
  findById(id: string): Product | undefined
}

/**
 * Valida o seed uma vez, na subida: se o formato mudar, a API não sobe,
 * em vez de responder dados quebrados.
 */

export function createProductRepository(seed: unknown): ProductRepository {
  const products = SeedSchema.parse(seed).products.map(toProduct)
  const byId = new Map(products.map((product) => [product.id, product]))

  return {
    all: () => products,
    findById: (id) => byId.get(id),
  }
}

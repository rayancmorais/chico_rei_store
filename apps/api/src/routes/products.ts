import { Router } from 'express'
import { ProductQuerySchema, type ProductQuery } from '@chico_rei_store/shared'
import { productNotFound } from '../http/api-error'
import { validateQuery } from '../middlewares/validate-query'
import type { ProductRepository } from '../repositories/product-repository'
import { buildFilters, listProducts } from '../services/product-service'

export function productRoutes(repository: ProductRepository): Router {
  const router = Router()

  router.get('/products', validateQuery(ProductQuerySchema), (_req, res) => {
    const query = res.locals.query as ProductQuery
    res.json(listProducts(repository.all(), query))
  })

  router.get('/products/:id', (req, res) => {
    const product = repository.findById(req.params.id)
    if (!product) throw productNotFound(req.params.id)
    res.json(product)
  })

  router.get('/filters', validateQuery(ProductQuerySchema), (_req, res) => {
    const query = res.locals.query as ProductQuery
    res.json(buildFilters(repository.all(), query))
  })

  return router
}

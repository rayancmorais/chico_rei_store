import express from 'express'
import helmet from 'helmet'
import { errorHandler, notFound } from './middlewares/error-handler'
import { simulateNetwork } from './middlewares/simulate-network'
import type { ProductRepository } from './repositories/product-repository'
import { productRoutes } from './routes/products'

interface AppOptions {
  repository: ProductRepository
  /** Liga o atraso e o `?__fail=1`. Nunca em produção. */
  simulation?: { latencyMs: number }
}

export function createApp({ repository, simulation }: AppOptions) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', products: repository.all().length })
  })

  // O seed é estático: o navegador pode reaproveitar a resposta por 5 minutos.
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300')
    next()
  })
  if (simulation) app.use('/api', simulateNetwork(simulation.latencyMs))
  app.use('/api', productRoutes(repository))

  app.use(notFound)
  app.use(errorHandler)
  return app
}

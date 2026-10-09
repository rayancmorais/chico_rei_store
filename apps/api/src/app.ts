import express from 'express'
import helmet from 'helmet'
import { ProductQuerySchema } from '@chico_rei_store/shared'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/api/products', (req, res) => {
    const parsed = ProductQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'INVALID_QUERY', message: 'Parâmetros inválidos' } })
      return
    }
    // Próximo passo: productService.list(parsed.data)
    res.json({ data: [], meta: { total: 0, ...parsed.data } })
  })

  return app
}

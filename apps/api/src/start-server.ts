import seed from '../../../data/seed.json'
import { createApp } from './app'
import { parseApiEnv } from './env'
import { createProductRepository } from './repositories/product-repository'

type Simulation = { latencyMs: number }

/** Sem `simulation` é o app de produção; só o dev-server.ts passa a simulação. */
export function createServerApp(simulation?: Simulation) {
  const repository = createProductRepository(seed)
  return { app: createApp({ repository, simulation }), repository }
}

export function startServer(simulation?: Simulation) {
  const { PORT } = parseApiEnv(process.env)
  const { app, repository } = createServerApp(simulation)
  app.listen(PORT, () => {
    console.log(`API em http://localhost:${PORT} (${repository.all().length} produtos)`)
  })
}

import seed from '../../../data/seed.json'
import { createApp } from './app'
import { parseApiEnv } from './env'
import { createProductRepository } from './repositories/product-repository'

const env = parseApiEnv(process.env)
const repository = createProductRepository(seed)

const app = createApp({
  repository,
  simulation: env.NODE_ENV === 'development' ? { latencyMs: env.SIMULATE_LATENCY_MS } : undefined,
})

app.listen(env.PORT, () => {
  console.log(`API em http://localhost:${env.PORT} (${repository.all().length} produtos)`)
})

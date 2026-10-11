import { parseApiEnv } from './env'
import { startServer } from './start-server'

// Só o `npm run dev`: SIMULATE_LATENCY_MS e `?__fail=1` deixam ver os estados de carregamento e de
// erro sem derrubar a API. Este arquivo não entra no build (o tsup empacota server.ts e handler.ts).
const { SIMULATE_LATENCY_MS } = parseApiEnv(process.env)
startServer({ latencyMs: SIMULATE_LATENCY_MS })

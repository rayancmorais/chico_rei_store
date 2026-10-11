import { z } from 'zod'

const ApiEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  SIMULATE_LATENCY_MS: z.coerce.number().int().min(0).default(0),
})

export const parseApiEnv = (env: NodeJS.ProcessEnv) => ApiEnvSchema.parse(env)

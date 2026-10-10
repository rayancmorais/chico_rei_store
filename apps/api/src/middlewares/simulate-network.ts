import type { RequestHandler } from 'express'
import { ApiError } from '../http/api-error'

/**
 * Só para desenvolvimento: deixa ver na tela os estados de carregamento e de erro
 * sem desligar a API. Atraso via SIMULATE_LATENCY_MS; falha via `?__fail=1`.
 */

export const simulateNetwork =
  (latencyMs: number): RequestHandler =>
  async (req, _res, next) => {
    if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
    if (req.query.__fail === '1') throw new ApiError(500, 'SIMULATED_FAILURE', 'Falha simulada')
    next()
  }

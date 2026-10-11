import type { RequestHandler } from 'express'
import type { z } from 'zod'
import { ApiError } from '../http/api-error'

/**
 * No Express 5, `req.query` é somente leitura: a query validada vai para
 * `res.locals.query`, e as rotas leem dali, já tipada.
 */
export const validateQuery =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      throw new ApiError(400, 'INVALID_QUERY', 'Parâmetros de busca inválidos', result.error.issues)
    }
    res.locals.query = result.data
    next()
  }

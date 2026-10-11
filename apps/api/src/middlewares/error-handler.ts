import type { ErrorRequestHandler, RequestHandler } from 'express'
import type { ApiErrorBody } from '@chico_rei_store/shared'
import { ApiError } from '../http/api-error'

export const notFound: RequestHandler = (req) => {
  throw new ApiError(404, 'NOT_FOUND', `Rota ${req.method} ${req.path} não existe`)
}

// Express só reconhece um handler de erro pelos 4 parâmetros, mesmo sem usar o `next`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const isExpected = error instanceof ApiError
  if (!isExpected) console.error(error) // erro previsto não precisa de stack trace no log

  const apiError = isExpected
    ? error
    : new ApiError(500, 'INTERNAL_ERROR', 'Erro inesperado no servidor')

  // As respostas de /api saem com max-age de 5 minutos; sem isso, um erro passageiro ficaria no
  // cache do navegador pelo mesmo tempo. O `notFound` também passa por aqui.
  res.set('Cache-Control', 'no-store')

  const body: ApiErrorBody = {
    error: { code: apiError.code, message: apiError.message, details: apiError.details },
  }
  res.status(apiError.status).json(body)
}

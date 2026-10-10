export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
  }
}

export const productNotFound = (id: string) =>
  new ApiError(404, 'PRODUCT_NOT_FOUND', `Produto ${id} não encontrado`)

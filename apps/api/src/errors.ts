/** Centralized error type + mapper (backend-patterns skill). zod → 400, ApiError → status, unknown → 500. */

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const badRequest = (message: string, details?: unknown): ApiError =>
  new ApiError(400, message, details)
export const unauthorized = (message = 'Unauthorized'): ApiError => new ApiError(401, message)
export const forbidden = (message = 'Forbidden'): ApiError => new ApiError(403, message)
export const notFound = (message = 'Not found'): ApiError => new ApiError(404, message)
export const conflict = (message: string, details?: unknown): ApiError =>
  new ApiError(409, message, details)
export const internalServerError = (message = 'Internal server error', details?: unknown): ApiError =>
  new ApiError(500, message, details)

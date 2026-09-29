import { AppError, normalizeAppError } from '../../application/errors/app-error'
import { dataResult, emptyResult, errorResult, type AppResult } from '../../application/results/app-result'

const REQUEST_TIMEOUT_MS = 15_000

// Only the BFF's normalized error envelope is safe to show; never expose arbitrary bodies.
function readErrorEnvelope(value: unknown): { message?: string; correlationId?: string } {
  if (!value || typeof value !== 'object') return {}
  const error = 'error' in value ? value.error : undefined
  const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message : undefined
  const correlationId = 'correlationId' in value && typeof value.correlationId === 'string'
    ? value.correlationId : undefined
  return { message, correlationId }
}

function httpError(status: number, payload: unknown): AppError {
  const { message, correlationId } = readErrorEnvelope(payload)
  const code = [400, 409, 413, 415, 422].includes(status) ? 'VALIDATION'
    : status === 401 ? 'AUTHENTICATION'
      : status === 403 ? 'AUTHORIZATION'
        : status >= 500 ? 'EXTERNAL_SERVICE' : 'UNEXPECTED'
  return new AppError({
    code, status, correlationId,
    message: message || (status === 401 ? 'Debe volver a verificar su sesion.'
      : status === 403 ? 'La operacion no esta permitida.'
        : status >= 500 ? 'El servicio no esta disponible temporalmente.'
          : 'No se pudo completar la operacion.'),
    retryable: status >= 500 || status === 429,
  })
}

export async function requestJsonResult<T>(path: string, method: string, body?: unknown): Promise<AppResult<T>> {
  const multipart = body instanceof FormData
  let requestBody: BodyInit | undefined
  try {
    requestBody = body === undefined ? undefined : multipart ? body : JSON.stringify(body)
  } catch (error) {
    return errorResult(normalizeAppError(error, 'No se pudo preparar la solicitud.'))
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(path, {
      method,
      headers: multipart ? undefined : { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: requestBody,
      signal: controller.signal,
    })
    const text = [204, 205].includes(response.status) ? '' : await response.text()
    let payload: unknown = null
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        if (response.ok) {
          return errorResult(new AppError({
            code: 'EXTERNAL_SERVICE', status: response.status,
            message: 'El servicio devolvio una respuesta no valida.',
          }))
        }
      }
    }
    if (!response.ok) return errorResult(httpError(response.status, payload))
    return text ? dataResult(payload as T) : emptyResult<T>()
  } catch (error) {
    return errorResult(new AppError({
      code: 'NETWORK',
      message: controller.signal.aborted
        ? 'La solicitud excedio el tiempo maximo de espera'
        : 'No se pudo conectar con el servicio',
      cause: error,
      retryable: true,
    }))
  } finally {
    clearTimeout(timeout)
  }
}

export async function requestJson<T>(path: string, method: string, body?: unknown): Promise<T> {
  const result = await requestJsonResult<T>(path, method, body)
  if (!result.ok) throw result.error
  if (result.kind === 'empty') {
    throw new AppError({ code: 'EXTERNAL_SERVICE', message: 'El servicio no devolvio los datos esperados.' })
  }
  return result.data
}

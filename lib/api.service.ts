import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import {
  AppResult,
  dataResult,
  emptyResult,
  errorResult,
} from '@/modules/shared/application/results/app-result';

const API_BASE_PATH = '/api/ciunac';
const REQUEST_TIMEOUT_MS = 15000;

function buildUrl(url: string) {
  return `${API_BASE_PATH}/${url.replace(/^\/+/, '')}`;
}

function createRequestOptions(method: string, body?: unknown, signal?: AbortSignal): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  };
}

async function executeRequest(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError({
        code: 'NETWORK',
        message: 'La solicitud excedio el tiempo maximo de espera',
        cause: error,
        retryable: true,
      });
    }

    throw new AppError({
      code: 'NETWORK',
      message: 'No se pudo conectar con el servicio',
      cause: error,
      retryable: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

type ErrorPayload = {
  error?: { message?: string };
  correlationId?: string;
};

function codeFromStatus(status: number): AppError['code'] {
  if (status === 400 || status === 409 || status === 422) return 'VALIDATION';
  if (status === 401) return 'AUTHENTICATION';
  if (status === 403) return 'AUTHORIZATION';
  if (status >= 500) return 'EXTERNAL_SERVICE';
  return 'UNEXPECTED';
}

function messageFromStatus(status: number, payload: ErrorPayload | null): string {
  const safeMessage = payload?.error?.message;
  if (safeMessage) return safeMessage;
  if (status === 401) return 'Debe volver a verificar su sesion.';
  if (status === 403) return 'La operacion no esta permitida.';
  if (status >= 500) return 'El servicio no esta disponible temporalmente.';
  return 'No se pudo completar la operacion.';
}

export async function apiFetchResult<T>(url: string, method: string, body?: unknown): Promise<AppResult<T>> {
  let response: Response;
  try {
    response = await executeRequest(buildUrl(url), createRequestOptions(method, body));
  } catch (error) {
    return errorResult(normalizeAppError(error, 'No se pudo conectar con el servicio'));
  }

  const text = response.status === 204 || response.status === 205 ? '' : await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      return errorResult(new AppError({
        code: 'EXTERNAL_SERVICE',
        message: 'El servicio devolvio una respuesta no valida.',
        status: response.status,
        cause: error,
        retryable: response.status >= 500,
      }));
    }
  }

  if (!response.ok) {
    const errorPayload = payload && typeof payload === 'object' ? payload as ErrorPayload : null;
    return errorResult(new AppError({
      code: codeFromStatus(response.status),
      message: messageFromStatus(response.status, errorPayload),
      status: response.status,
      correlationId: errorPayload?.correlationId,
      retryable: response.status >= 500,
    }));
  }

  return text ? dataResult(payload as T) : emptyResult<T>();
}

export async function apiFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const result = await apiFetchResult<T>(url, method, body);
  if (!result.ok) throw result.error;
  if (result.kind === 'empty') {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio no devolvio los datos esperados.',
      retryable: false,
    });
  }
  return result.data;
}

export async function apiFetchOptional<T>(url: string, method: string, body?: unknown): Promise<T | null> {
  const result = await apiFetchResult<T>(url, method, body);
  if (!result.ok) {
    if (result.error.status === 404) return null;
    throw result.error;
  }
  return result.kind === 'empty' ? null : result.data;
}

export async function apiCommand(url: string, method: string, body?: unknown): Promise<void> {
  const result = await apiFetchResult<unknown>(url, method, body);
  if (!result.ok) throw result.error;
}

// A safe variant that does not throw on HTTP errors and returns structured info
export async function apiFetchSafe<T>(url: string, method: string, body?: unknown): Promise<
  AppResult<T>
> {
  return apiFetchResult<T>(url, method, body);
}

export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
  const response = await executeRequest(buildUrl(url), {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: payload?.error?.message ?? 'No se pudo cargar el archivo',
      status: response.status,
    });
  }

  const text = await response.text();
  if (!text) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio de archivos no devolvio los datos esperados.',
    });
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio de archivos devolvio una respuesta no valida.',
      cause: error,
    });
  }
}


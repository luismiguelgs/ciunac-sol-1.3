import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';

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
    body: body ? JSON.stringify(body) : undefined,
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
      });
    }

    throw normalizeAppError(error, 'No se pudo completar la solicitud HTTP');
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await executeRequest(buildUrl(url), createRequestOptions(method, body));

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new AppError({
      code: 'INTEGRATION',
      message: payload?.error?.message ?? 'No se pudo completar la solicitud',
      status: response.status,
    });
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}

// A safe variant that does not throw on HTTP errors and returns structured info
export async function apiFetchSafe<T>(url: string, method: string, body?: unknown): Promise<
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; body?: unknown }
> {
  const response = await executeRequest(buildUrl(url), createRequestOptions(method, body));

  const status = response.status;
  const contentType = response.headers.get('content-type') || '';

  if (response.ok) {
    const data = contentType.includes('application/json') ? ((await response.json()) as T) : (undefined as unknown as T);
    return { ok: true, status, data };
  }

  let errorText = '';
  let errBody: unknown = undefined;
  try {
    if (contentType.includes('application/json')) {
      errBody = await response.json();
      errorText = typeof errBody === 'object' ? JSON.stringify(errBody) : String(errBody);
    } else {
      errorText = await response.text();
    }
  } catch {
    // ignore parse errors
  }

  return { ok: false, status, error: errorText || 'Request failed', body: errBody };
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
      code: 'INTEGRATION',
      message: payload?.error?.message ?? 'No se pudo cargar el archivo',
      status: response.status,
    });
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}


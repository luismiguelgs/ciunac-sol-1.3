import { getCiunacConfig } from '@/modules/security/server/environment';
import { SecurityError } from '@/modules/security/server/security-error';

type CiunacRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
};

export async function ciunacRequest<T>(path: string, options: CiunacRequestOptions = {}): Promise<T> {
  const { apiKey, apiUrl } = getCiunacConfig();
  const normalizedPath = path.replace(/^\/+/, '');

  if (!normalizedPath || normalizedPath.includes('..')) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Invalid upstream path');
  }

  const method = options.method ?? 'GET';
  const isFormData = options.body instanceof FormData;
  const headers = new Headers({ 'x-api-key': apiKey });
  if (options.body !== undefined && !isFormData) headers.set('Content-Type', 'application/json');
  const requestBody: BodyInit | undefined = options.body === undefined
    ? undefined
    : isFormData
      ? options.body as FormData
      : JSON.stringify(options.body);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/${normalizedPath}`, {
      method,
      headers,
      body: requestBody,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'CIUNAC API is unavailable');
  }

  if (!response.ok) {
    const status = response.status >= 400 && response.status < 500 ? response.status : 503;
    throw new SecurityError('UPSTREAM_ERROR', status, 'CIUNAC API rejected the request');
  }

  const text = await response.text();
  if (!text) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SecurityError('UPSTREAM_ERROR', 502, 'CIUNAC API returned an invalid response');
  }
}

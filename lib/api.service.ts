const API_URL = process.env.NEXT_PUBLIC_API_URL;
const apiKey: string = process.env.NEXT_PUBLIC_API_KEY!;

export async function apiFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}/${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`HTTP error! status: ${response.status}: ${msg}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as any);
}

// A safe variant that does not throw on HTTP errors and returns structured info
export async function apiFetchSafe<T>(url: string, method: string, body?: unknown): Promise<
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; body?: unknown }
> {
  const response = await fetch(`${API_URL}/${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

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

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = { ...obj };
  keys.forEach((key) => {
    delete copy[key];
  });
  return copy;
}

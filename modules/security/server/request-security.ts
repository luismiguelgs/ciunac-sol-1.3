import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAppOrigin } from '@/modules/security/server/environment';
import { SecurityError } from '@/modules/security/server/security-error';

const MAX_JSON_BYTES = 1024 * 1024;

export function assertTrustedOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin');
  if (!origin || origin !== getAppOrigin()) {
    throw new SecurityError('INVALID_ORIGIN', 403, 'Request origin is not allowed');
  }
}

export async function parseJsonBody<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new SecurityError('INVALID_REQUEST', 415, 'Content-Type must be application/json');
  }

  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    throw new SecurityError('INVALID_REQUEST', 413, 'Request payload is too large');
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new SecurityError('INVALID_REQUEST', 400, 'Request body is not valid JSON');
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Request body is invalid');
  }

  return parsed.data;
}

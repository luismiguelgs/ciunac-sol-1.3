import { SecurityError } from '@/modules/security/server/security-error';

export function logServerError(event: string, correlationId: string, error: unknown): void {
  const status = error instanceof SecurityError ? error.status : 500;
  const code = error instanceof SecurityError ? error.code : 'UNEXPECTED';

  console.error(JSON.stringify({ event, correlationId, status, code }));
}

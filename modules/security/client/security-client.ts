import { requestJson } from '@/modules/shared/infrastructure/http/browser-http';
import { AppError } from '@/modules/shared/application/errors/app-error';
import { ConsultationType, NotificationType, OtpPurpose } from '@/modules/security/domain/security.types';

async function postSecurity<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const payload = await requestJson<TResponse>(path, 'POST', body);
  if (!payload) {
    throw new AppError({ code: 'EXTERNAL_SERVICE', message: 'El servicio devolvio una respuesta no valida.' });
  }
  return payload;
}

export function requestOtp(email: string, purpose: OtpPurpose, captchaToken: string) {
  return postSecurity<{
    ok: true;
    expiresInSeconds: number;
    resendInSeconds: number;
  }, { email: string; purpose: OtpPurpose; captchaToken: string }>(
    '/api/security/otp/request',
    { email, purpose, captchaToken },
  );
}

export function verifyOtp(email: string, purpose: OtpPurpose, code: string) {
  return postSecurity<{ ok: true }, { email: string; purpose: OtpPurpose; code: string }>(
    '/api/security/otp/verify',
    { email, purpose, code },
  );
}

export async function consultByDocument(documento: string, type: ConsultationType, captchaToken: string) {
  const response = await postSecurity<unknown, { documento: string; type: ConsultationType; captchaToken: string }>(
    '/api/security/consulta',
    { documento, type, captchaToken },
  );
  if (!isConsultationCheckResponse(response)) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio de consulta devolvio una respuesta no valida.',
    });
  }
  return response;
}

export function sendSecureNotification(type: NotificationType, reference: string) {
  return postSecurity<{ ok: true; receiptId: string }, { type: NotificationType; reference: string }>(
    '/api/security/notifications',
    { type, reference },
  );
}

function isConsultationCheckResponse(value: unknown): value is { ok: true; found: boolean } {
  return typeof value === 'object'
    && value !== null
    && 'ok' in value
    && value.ok === true
    && 'found' in value
    && typeof value.found === 'boolean';
}

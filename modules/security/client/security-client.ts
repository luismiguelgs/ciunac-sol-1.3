import { AppError } from '@/modules/shared/application/errors/app-error';
import { ConsultationType, NotificationType, OtpPurpose } from '@/modules/security/domain/security.types';

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

async function postSecurity<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new AppError({ code: 'NETWORK', message: 'No se pudo conectar con el servicio', cause: error });
  }

  const payload = await response.json().catch(() => null) as (TResponse & ErrorPayload) | null;
  if (!response.ok) {
    throw new AppError({
      code: response.status === 400 ? 'VALIDATION' : 'INTEGRATION',
      message: payload?.error?.message ?? 'No se pudo completar la operacion',
      status: response.status,
    });
  }

  return payload as TResponse;
}

export function requestOtp(email: string, purpose: OtpPurpose, captchaToken: string) {
  return postSecurity<{ ok: true }, { email: string; purpose: OtpPurpose; captchaToken: string }>(
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

export function consultByDocument(documento: string, type: ConsultationType, captchaToken: string) {
  return postSecurity<{ ok: true; found: boolean }, { documento: string; type: ConsultationType; captchaToken: string }>(
    '/api/security/consulta',
    { documento, type, captchaToken },
  );
}

export function sendSecureNotification(type: NotificationType, reference: string) {
  return postSecurity<{ ok: true }, { type: NotificationType; reference: string }>(
    '/api/security/notifications',
    { type, reference },
  );
}

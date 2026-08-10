import { AppError } from '@/modules/shared/application/errors/app-error';
import { ConsultationType, NotificationType, OtpPurpose } from '@/modules/security/domain/security.types';
import { consultationCheckResponseSchema } from '@/modules/consultas/infrastructure/validation/consultation.schemas';

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  correlationId?: string;
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
    const code = response.status === 400 || response.status === 409 || response.status === 422
      ? 'VALIDATION'
      : response.status === 401
        ? 'AUTHENTICATION'
        : response.status === 403
          ? 'AUTHORIZATION'
          : response.status >= 500
            ? 'EXTERNAL_SERVICE'
            : 'UNEXPECTED';
    throw new AppError({
      code,
      message: payload?.error?.message ?? 'No se pudo completar la operacion',
      status: response.status,
      correlationId: payload?.correlationId,
      retryable: response.status >= 500,
    });
  }

  if (!payload) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio devolvio una respuesta no valida.',
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

export async function consultByDocument(documento: string, type: ConsultationType, captchaToken: string) {
  const response = await postSecurity<unknown, { documento: string; type: ConsultationType; captchaToken: string }>(
    '/api/security/consulta',
    { documento, type, captchaToken },
  );
  const result = consultationCheckResponseSchema.safeParse(response);
  if (!result.success) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio de consulta devolvio una respuesta no valida.',
    });
  }
  return result.data;
}

export function sendSecureNotification(type: NotificationType, reference: string) {
  return postSecurity<{ ok: true; receiptId: string }, { type: NotificationType; reference: string }>(
    '/api/security/notifications',
    { type, reference },
  );
}

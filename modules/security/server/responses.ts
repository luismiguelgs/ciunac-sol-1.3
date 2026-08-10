import { NextResponse } from 'next/server';
import { logServerError } from '@/modules/security/server/logger';
import { SecurityError, SecurityErrorCode } from '@/modules/security/server/security-error';

const PUBLIC_MESSAGES: Record<SecurityErrorCode, string> = {
  INVALID_REQUEST: 'La solicitud no es valida.',
  INVALID_FILE: 'El archivo no es valido. Use PDF, JPG o PNG de hasta 8 MB.',
  INVALID_ORIGIN: 'La solicitud no esta permitida.',
  CAPTCHA_FAILED: 'No se pudo validar el CAPTCHA.',
  VERIFICATION_FAILED: 'El codigo de verificacion es incorrecto.',
  OTP_EXPIRED: 'El codigo de verificacion ha expirado.',
  OTP_REUSED: 'El codigo de verificacion ya fue utilizado.',
  MAX_ATTEMPTS: 'Se alcanzo el maximo de intentos permitidos.',
  RESEND_TOO_SOON: 'Espere antes de solicitar un nuevo codigo.',
  RATE_LIMITED: 'Se alcanzo el limite temporal de solicitudes.',
  PRICE_CHANGED: 'El tarifario cambio. Revise nuevamente el monto antes de continuar.',
  DUPLICATE_REQUEST: 'Ya existe una solicitud de ubicacion en proceso para estos datos.',
  UNAUTHORIZED: 'Debe verificar su correo antes de continuar.',
  FORBIDDEN: 'La operacion no esta permitida.',
  UPSTREAM_ERROR: 'No se pudo completar la operacion solicitada.',
  SERVICE_UNAVAILABLE: 'El servicio no esta disponible temporalmente.',
};

export function securityErrorResponse(event: string, correlationId: string, error: unknown): NextResponse {
  const securityError = error instanceof SecurityError
    ? error
    : new SecurityError('SERVICE_UNAVAILABLE', 503, 'Unexpected server error');

  if (securityError.status >= 500) {
    logServerError(event, correlationId, securityError);
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: securityError.code,
        message: PUBLIC_MESSAGES[securityError.code],
      },
      correlationId,
    },
    { status: securityError.status },
  );
}

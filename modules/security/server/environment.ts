import 'server-only';
import { SecurityError } from '@/modules/security/server/security-error';

const MIN_SECRET_BYTES = 32;

function requireValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, `Missing server configuration: ${name}`);
  }

  return value;
}

function requireUrl(name: string, fallbackName?: string): string {
  const rawValue = process.env[name]?.trim() || (fallbackName ? process.env[fallbackName]?.trim() : '');

  if (!rawValue) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, `Missing server configuration: ${name}`);
  }

  try {
    return new URL(rawValue).toString().replace(/\/$/, '');
  } catch {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, `Invalid server configuration: ${name}`);
  }
}

export function getCiunacConfig() {
  return {
    apiKey: requireValue('API_KEY'),
    apiUrl: requireUrl('API_URL', 'NEXT_PUBLIC_API_URL'),
  };
}

export function getCaptchaSecret(): string {
  return requireValue('RECAPTCHA_SECRET_KEY');
}

export function getOtpSessionSecret(): string {
  const secret = requireValue('OTP_SESSION_SECRET');

  if (Buffer.byteLength(secret, 'utf8') < MIN_SECRET_BYTES) {
    throw new SecurityError(
      'SERVICE_UNAVAILABLE',
      503,
      `Invalid server configuration: OTP_SESSION_SECRET must contain at least ${MIN_SECRET_BYTES} bytes`,
    );
  }

  return secret;
}

export function getAppOrigin(): string {
  return new URL(requireUrl('APP_BASE_URL')).origin;
}

export function getQ10ApiKey(): string {
  return requireValue('API_KEY_Q10');
}

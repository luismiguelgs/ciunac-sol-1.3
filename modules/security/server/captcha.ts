import { getCaptchaSecret } from '@/modules/security/server/environment';
import { SecurityError } from '@/modules/security/server/security-error';

type CaptchaResponse = {
  success?: boolean;
  hostname?: string;
  'error-codes'?: string[];
};

export async function verifyCaptchaToken(
  token: string,
  remoteIp?: string,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const body = new URLSearchParams({
    secret: getCaptchaSecret(),
    response: token,
  });

  if (remoteIp) body.set('remoteip', remoteIp);

  let response: Response;
  try {
    response = await fetcher('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'CAPTCHA provider is unavailable');
  }

  if (!response.ok) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'CAPTCHA provider is unavailable');
  }

  const result = await response.json() as CaptchaResponse;
  if (result.success !== true) {
    throw new SecurityError('CAPTCHA_FAILED', 400, 'CAPTCHA verification failed');
  }
}

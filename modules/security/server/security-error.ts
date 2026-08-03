export type SecurityErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_ORIGIN'
  | 'CAPTCHA_FAILED'
  | 'VERIFICATION_FAILED'
  | 'OTP_EXPIRED'
  | 'OTP_REUSED'
  | 'MAX_ATTEMPTS'
  | 'RESEND_TOO_SOON'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'UPSTREAM_ERROR'
  | 'SERVICE_UNAVAILABLE';

export class SecurityError extends Error {
  constructor(
    readonly code: SecurityErrorCode,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { OtpPurpose } from '@/modules/security/domain/security.types';
import { SecurityError } from '@/modules/security/server/security-error';

export const OTP_EXPIRATION_SECONDS = 5 * 60;
export const OTP_EXPIRATION_MS = OTP_EXPIRATION_SECONDS * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_DELAY_SECONDS = 3 * 60;
export const OTP_RESEND_DELAY_MS = OTP_RESEND_DELAY_SECONDS * 1000;
export const OTP_RATE_WINDOW_MS = 15 * 60 * 1000;
export const OTP_MAX_SENDS_PER_WINDOW = 5;

export type OtpChallenge = {
  challengeId: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: number;
  attemptsRemaining: number;
  sentAt: number[];
  consumedAt?: number;
};

type CreateChallengeInput = {
  email: string;
  purpose: OtpPurpose;
  secret: string;
  now?: number;
  previous?: OtpChallenge | null;
  generateCode?: () => string;
};

export type OtpVerificationResult =
  | { ok: true; challenge: OtpChallenge }
  | { ok: false; code: 'OTP_EXPIRED' | 'OTP_REUSED' | 'MAX_ATTEMPTS' | 'VERIFICATION_FAILED'; challenge: OtpChallenge };

export function generateOtpCode(): string {
  return randomInt(100_000, 1_000_000).toString();
}

function hashOtp(challengeId: string, code: string, secret: string): string {
  return createHmac('sha256', secret).update(`${challengeId}:${code}`, 'utf8').digest('hex');
}

function hashesMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function createOtpChallenge(input: CreateChallengeInput): { challenge: OtpChallenge; code: string } {
  const now = input.now ?? Date.now();
  const recentSends = (input.previous?.sentAt ?? []).filter((sentAt) => sentAt >= now - OTP_RATE_WINDOW_MS);
  const lastSentAt = recentSends.at(-1);

  if (lastSentAt && now - lastSentAt < OTP_RESEND_DELAY_MS) {
    throw new SecurityError('RESEND_TOO_SOON', 429, 'Wait before requesting another code');
  }

  if (recentSends.length >= OTP_MAX_SENDS_PER_WINDOW) {
    throw new SecurityError('RATE_LIMITED', 429, 'Too many verification codes requested');
  }

  const code = (input.generateCode ?? generateOtpCode)();
  if (!/^[1-9]\d{5}$/.test(code)) {
    throw new Error('OTP generator must return exactly six digits without a leading zero');
  }

  const challengeId = randomUUID();
  const challenge: OtpChallenge = {
    challengeId,
    email: input.email.trim().toLowerCase(),
    purpose: input.purpose,
    codeHash: hashOtp(challengeId, code, input.secret),
    expiresAt: now + OTP_EXPIRATION_MS,
    attemptsRemaining: OTP_MAX_ATTEMPTS,
    sentAt: [...recentSends, now],
  };

  return { challenge, code };
}

export function verifyOtpCode(
  challenge: OtpChallenge,
  code: string,
  secret: string,
  now = Date.now(),
): OtpVerificationResult {
  if (challenge.consumedAt) {
    return { ok: false, code: 'OTP_REUSED', challenge };
  }

  if (now > challenge.expiresAt) {
    return { ok: false, code: 'OTP_EXPIRED', challenge };
  }

  if (challenge.attemptsRemaining <= 0) {
    return { ok: false, code: 'MAX_ATTEMPTS', challenge };
  }

  const candidateHash = hashOtp(challenge.challengeId, code, secret);
  if (!hashesMatch(candidateHash, challenge.codeHash)) {
    const updated = { ...challenge, attemptsRemaining: challenge.attemptsRemaining - 1 };
    return {
      ok: false,
      code: updated.attemptsRemaining <= 0 ? 'MAX_ATTEMPTS' : 'VERIFICATION_FAILED',
      challenge: updated,
    };
  }

  return { ok: true, challenge: { ...challenge, consumedAt: now } };
}

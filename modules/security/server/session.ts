import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ConsultationType, NotificationType, OtpPurpose } from '@/modules/security/domain/security.types';
import { getOtpSessionSecret } from '@/modules/security/server/environment';
import { OtpChallenge } from '@/modules/security/server/otp';
import { decryptToken, encryptToken } from '@/modules/security/server/token-crypto';

const OTP_CHALLENGE_COOKIE = 'ciunac_otp_challenge';
const VERIFIED_SESSION_COOKIE = 'ciunac_verified_session';
const CONSULTATION_SESSION_COOKIE = 'ciunac_consultation_session';
const NOTIFICATION_RECEIPT_COOKIE = 'ciunac_notification_receipt';
const VERIFIED_SESSION_MS = 15 * 60 * 1000;
const CONSULTATION_SESSION_MS = 10 * 60 * 1000;
const CHALLENGE_COOKIE_MS = 15 * 60 * 1000;
const NOTIFICATION_RECEIPT_MS = 15 * 60 * 1000;

export type VerifiedSession = {
  kind: 'verified-email';
  email: string;
  purpose: OtpPurpose;
  expiresAt: number;
};

export type ConsultationSession = {
  kind: 'consultation';
  documento: string;
  type: ConsultationType;
  expiresAt: number;
};

export type NotificationReceipt = {
  kind: 'notification-receipt';
  receiptId: string;
  type: NotificationType;
  reference: string;
  expiresAt: number;
};

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

function decodeCookie<T>(value: string | undefined): T | null {
  return decryptToken<T>(value, getOtpSessionSecret());
}

function isCurrent(expiresAt: number | undefined, now = Date.now()): boolean {
  return typeof expiresAt === 'number' && expiresAt > now;
}

export function readOtpChallenge(request: NextRequest): OtpChallenge | null {
  const challenge = decodeCookie<OtpChallenge>(request.cookies.get(OTP_CHALLENGE_COOKIE)?.value);
  return challenge?.challengeId ? challenge : null;
}

export function writeOtpChallenge(response: NextResponse, challenge: OtpChallenge): void {
  response.cookies.set(
    OTP_CHALLENGE_COOKIE,
    encryptToken(challenge, getOtpSessionSecret()),
    cookieOptions(CHALLENGE_COOKIE_MS),
  );
}

export function clearOtpChallenge(response: NextResponse): void {
  response.cookies.set(OTP_CHALLENGE_COOKIE, '', { ...cookieOptions(0), maxAge: 0 });
}

export function readVerifiedSessionFromRequest(
  request: NextRequest,
  purpose?: OtpPurpose,
): VerifiedSession | null {
  const session = decodeCookie<VerifiedSession>(request.cookies.get(VERIFIED_SESSION_COOKIE)?.value);
  if (!session || session.kind !== 'verified-email' || !isCurrent(session.expiresAt)) return null;
  if (purpose && session.purpose !== purpose) return null;
  return session;
}

export function writeVerifiedSession(
  response: NextResponse,
  email: string,
  purpose: OtpPurpose,
  now = Date.now(),
): void {
  const session: VerifiedSession = {
    kind: 'verified-email',
    email: email.trim().toLowerCase(),
    purpose,
    expiresAt: now + VERIFIED_SESSION_MS,
  };

  response.cookies.set(
    VERIFIED_SESSION_COOKIE,
    encryptToken(session, getOtpSessionSecret()),
    cookieOptions(VERIFIED_SESSION_MS),
  );
}

export async function readVerifiedSession(purpose?: OtpPurpose): Promise<VerifiedSession | null> {
  const cookieStore = await cookies();
  const session = decodeCookie<VerifiedSession>(cookieStore.get(VERIFIED_SESSION_COOKIE)?.value);
  if (!session || session.kind !== 'verified-email' || !isCurrent(session.expiresAt)) return null;
  if (purpose && session.purpose !== purpose) return null;
  return session;
}

export function writeConsultationSession(
  response: NextResponse,
  documento: string,
  type: ConsultationType,
  now = Date.now(),
): void {
  const session: ConsultationSession = {
    kind: 'consultation',
    documento,
    type,
    expiresAt: now + CONSULTATION_SESSION_MS,
  };

  response.cookies.set(
    CONSULTATION_SESSION_COOKIE,
    encryptToken(session, getOtpSessionSecret()),
    cookieOptions(CONSULTATION_SESSION_MS),
  );
}

export function readConsultationSessionFromRequest(request: NextRequest): ConsultationSession | null {
  const session = decodeCookie<ConsultationSession>(request.cookies.get(CONSULTATION_SESSION_COOKIE)?.value);
  if (!session || session.kind !== 'consultation' || !isCurrent(session.expiresAt)) return null;
  return session;
}

export async function readConsultationSession(
  type?: ConsultationType,
  documento?: string,
): Promise<ConsultationSession | null> {
  const cookieStore = await cookies();
  const session = decodeCookie<ConsultationSession>(cookieStore.get(CONSULTATION_SESSION_COOKIE)?.value);
  if (!session || session.kind !== 'consultation' || !isCurrent(session.expiresAt)) return null;
  if (type && session.type !== type) return null;
  if (documento && session.documento !== documento.toUpperCase()) return null;
  return session;
}

export function writeNotificationReceipt(
  response: NextResponse,
  receiptId: string,
  type: NotificationType,
  reference: string,
  now = Date.now(),
): void {
  const receipt: NotificationReceipt = {
    kind: 'notification-receipt',
    receiptId,
    type,
    reference,
    expiresAt: now + NOTIFICATION_RECEIPT_MS,
  };

  response.cookies.set(
    NOTIFICATION_RECEIPT_COOKIE,
    encryptToken(receipt, getOtpSessionSecret()),
    cookieOptions(NOTIFICATION_RECEIPT_MS),
  );
}

export async function readNotificationReceipt(
  receiptId: string | undefined,
  type: NotificationType,
  reference?: string,
): Promise<NotificationReceipt | null> {
  if (!receiptId) return null;

  const cookieStore = await cookies();
  const receipt = decodeCookie<NotificationReceipt>(cookieStore.get(NOTIFICATION_RECEIPT_COOKIE)?.value);
  if (!receipt || receipt.kind !== 'notification-receipt' || !isCurrent(receipt.expiresAt)) return null;
  if (receipt.receiptId !== receiptId || receipt.type !== type) return null;
  if (reference && receipt.reference !== reference) return null;
  return receipt;
}

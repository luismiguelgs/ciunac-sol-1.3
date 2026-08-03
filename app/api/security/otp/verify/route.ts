import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getOtpSessionSecret } from '@/modules/security/server/environment';
import { verifyOtpCode } from '@/modules/security/server/otp';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { securityErrorResponse } from '@/modules/security/server/responses';
import { otpVerifySchema } from '@/modules/security/server/schemas';
import {
  clearOtpChallenge,
  readOtpChallenge,
  writeOtpChallenge,
  writeVerifiedSession,
} from '@/modules/security/server/session';
import { SecurityError } from '@/modules/security/server/security-error';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const correlationId = randomUUID();

  try {
    assertTrustedOrigin(request);
    const input = await parseJsonBody(request, otpVerifySchema);
    const challenge = readOtpChallenge(request);

    if (!challenge || challenge.email !== input.email || challenge.purpose !== input.purpose) {
      throw new SecurityError('VERIFICATION_FAILED', 400, 'OTP challenge does not match');
    }

    const result = verifyOtpCode(challenge, input.code, getOtpSessionSecret());
    if (!result.ok) {
      const response = securityErrorResponse(
        'security.otp.verify.rejected',
        correlationId,
        new SecurityError(result.code, result.code === 'MAX_ATTEMPTS' ? 429 : 400, 'OTP verification rejected'),
      );

      if (result.code === 'VERIFICATION_FAILED') {
        writeOtpChallenge(response, result.challenge);
      } else {
        clearOtpChallenge(response);
      }
      return response;
    }

    const response = NextResponse.json({ ok: true });
    clearOtpChallenge(response);
    writeVerifiedSession(response, challenge.email, challenge.purpose);
    return response;
  } catch (error) {
    return securityErrorResponse('security.otp.verify.failed', correlationId, error);
  }
}

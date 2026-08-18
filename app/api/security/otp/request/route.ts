import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCaptchaToken } from '@/modules/security/server/captcha';
import { ciunacRequest } from '@/modules/security/server/ciunac-client';
import { getOtpSessionSecret } from '@/modules/security/server/environment';
import {
  createOtpChallenge,
  OTP_EXPIRATION_SECONDS,
  OTP_RESEND_DELAY_SECONDS,
} from '@/modules/security/server/otp';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { securityErrorResponse } from '@/modules/security/server/responses';
import { otpRequestSchema } from '@/modules/security/server/schemas';
import { readOtpChallenge, writeOtpChallenge } from '@/modules/security/server/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const correlationId = randomUUID();

  try {
    assertTrustedOrigin(request);
    const input = await parseJsonBody(request, otpRequestSchema);
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    await verifyCaptchaToken(input.captchaToken, remoteIp);

    const { challenge, code } = createOtpChallenge({
      email: input.email,
      purpose: input.purpose,
      previous: readOtpChallenge(request),
      secret: getOtpSessionSecret(),
    });

    await ciunacRequest('mailer', {
      method: 'POST',
      body: {
        type: 'RANDOM',
        email: challenge.email,
        number: Number(code),
      },
    });

    const response = NextResponse.json({
      ok: true,
      expiresInSeconds: OTP_EXPIRATION_SECONDS,
      resendInSeconds: OTP_RESEND_DELAY_SECONDS,
    }, { status: 202 });
    writeOtpChallenge(response, challenge);
    return response;
  } catch (error) {
    return securityErrorResponse('security.otp.request.failed', correlationId, error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyCaptchaToken } from '@/modules/security/server/captcha';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { handleSecurityRoute } from '@/modules/security/server/responses';
import { consultationSchema } from '@/modules/security/server/schemas';
import { writeConsultationSession } from '@/modules/security/server/session';
import { findConsultationRequests } from '@/modules/consultas/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleSecurityRoute('security.consultation.failed', async () => {
    assertTrustedOrigin(request);
    const input = await parseJsonBody(request, consultationSchema);
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    await verifyCaptchaToken(input.captchaToken, remoteIp);

    const { documentNumber, requests } = await findConsultationRequests({
      documentNumber: input.documento,
      type: input.type,
    });
    const found = requests.length > 0;
    const response = NextResponse.json({ ok: true, found });

    if (found) {
      writeConsultationSession(response, documentNumber, input.type);
    }

    return response;
  });
}

import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCaptchaToken } from '@/modules/security/server/captcha';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { securityErrorResponse } from '@/modules/security/server/responses';
import { consultationSchema } from '@/modules/security/server/schemas';
import { writeConsultationSession } from '@/modules/security/server/session';
import { matchesConsultationType, normalizeConsultationDocument } from '@/modules/consultas/domain/consulted-request';
import { serverConsultationRequestRepository } from '@/modules/consultas/infrastructure/server/consultation.repository';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const correlationId = randomUUID();

  try {
    assertTrustedOrigin(request);
    const input = await parseJsonBody(request, consultationSchema);
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    await verifyCaptchaToken(input.captchaToken, remoteIp);

    const documentNumber = normalizeConsultationDocument(input.documento);
    const solicitudes = await serverConsultationRequestRepository.findByDocument(documentNumber);
    const found = solicitudes.some((item) => matchesConsultationType(item, input.type));
    const response = NextResponse.json({ ok: true, found });

    if (found) {
      writeConsultationSession(response, documentNumber, input.type);
    }

    return response;
  } catch (error) {
    return securityErrorResponse('security.consultation.failed', correlationId, error);
  }
}

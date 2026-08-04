import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface';
import { verifyCaptchaToken } from '@/modules/security/server/captcha';
import { ciunacRequest } from '@/modules/security/server/ciunac-client';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { securityErrorResponse } from '@/modules/security/server/responses';
import { consultationSchema } from '@/modules/security/server/schemas';
import { writeConsultationSession } from '@/modules/security/server/session';
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response';

export const runtime = 'nodejs';

function isRequestedType(item: ISolicitudRes, type: 'CERTIFICADO' | 'EXAMEN'): boolean {
  const name = item.tiposSolicitud?.solicitud
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase() ?? '';

  return type === 'EXAMEN' ? name.includes('UBICACION') : !name.includes('UBICACION');
}

export async function POST(request: NextRequest) {
  const correlationId = randomUUID();

  try {
    assertTrustedOrigin(request);
    const input = await parseJsonBody(request, consultationSchema);
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    await verifyCaptchaToken(input.captchaToken, remoteIp);

    const upstream = await ciunacRequest<unknown>(`solicitudes/documento/${input.documento}`);
    const solicitudes = upstream === null
      ? []
      : parseExternalResponse(externalRecordArraySchema, upstream, 'Invalid consultation response') as unknown as ISolicitudRes[];
    const found = solicitudes.some((item) => isRequestedType(item, input.type));
    const response = NextResponse.json({ ok: true, found });

    if (found) {
      writeConsultationSession(response, input.documento, input.type);
    }

    return response;
  } catch (error) {
    return securityErrorResponse('security.consultation.failed', correlationId, error);
  }
}

import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { OtpPurpose } from '@/modules/security/domain/security.types';
import { ciunacRequest } from '@/modules/security/server/ciunac-client';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { securityErrorResponse } from '@/modules/security/server/responses';
import { notificationSchema } from '@/modules/security/server/schemas';
import {
  readVerifiedSessionFromRequest,
  writeNotificationReceipt,
} from '@/modules/security/server/session';
import { SecurityError } from '@/modules/security/server/security-error';

export const runtime = 'nodejs';

const PURPOSES_BY_NOTIFICATION: Record<string, OtpPurpose[]> = {
  CERTIFICADO: ['CERTIFICADO', 'CONSTANCIA'],
  BECA: ['BECA'],
  UBICACION: ['UBICACION'],
  REGISTER: ['NUEVO'],
};

export async function POST(request: NextRequest) {
  const correlationId = randomUUID();

  try {
    assertTrustedOrigin(request);
    const input = await parseJsonBody(request, notificationSchema);
    const session = readVerifiedSessionFromRequest(request);

    if (!session) {
      throw new SecurityError('UNAUTHORIZED', 401, 'Verified session is required');
    }

    if (!PURPOSES_BY_NOTIFICATION[input.type].includes(session.purpose)) {
      throw new SecurityError('FORBIDDEN', 403, 'Notification does not match verified purpose');
    }

    await ciunacRequest('mailer', {
      method: 'POST',
      body: {
        type: input.type,
        email: session.email,
        user: input.reference,
      },
    });

    const receiptId = randomUUID();
    const response = NextResponse.json({ ok: true, receiptId }, { status: 202 });
    writeNotificationReceipt(response, receiptId, input.type, input.reference);
    return response;
  } catch (error) {
    return securityErrorResponse('security.notification.failed', correlationId, error);
  }
}

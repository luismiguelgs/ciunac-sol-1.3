import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security'
import { securityErrorResponse } from '@/modules/security/server/responses'
import { readVerifiedSessionFromRequest } from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'
import {
  locationProfileCommandSchema,
  writeLocationProfile,
} from '@/modules/solicitud-ubicacion/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const correlationId = randomUUID()
  try {
    assertTrustedOrigin(request)
    const session = readVerifiedSessionFromRequest(request, 'UBICACION')
    if (!session) throw new SecurityError('UNAUTHORIZED', 401, 'Verified UBICACION session is required')
    const input = await parseJsonBody(request, locationProfileCommandSchema)
    const response = NextResponse.json({ ok: true })
    writeLocationProfile(response, input.isCiunacStudent)
    return response
  } catch (error) {
    return securityErrorResponse('security.location.profile.failed', correlationId, error)
  }
}

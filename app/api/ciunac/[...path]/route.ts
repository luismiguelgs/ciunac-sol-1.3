import { NextRequest, NextResponse } from 'next/server'
import {
  assertCiunacProxyAccess,
  resolveCiunacProxyOperation,
  type CiunacProxyMethod,
} from '@/app/api/ciunac/proxy-policy'
import {
  validateCiunacProxyBody,
  validateCiunacProxyResponse,
} from '@/app/api/ciunac/proxy-validation'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { assertTrustedOrigin } from '@/modules/security/server/request-security'
import { handleSecurityRoute } from '@/modules/security/server/responses'
import {
  readConsultationSessionFromRequest,
  readVerifiedSessionFromRequest,
} from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ path: string[] }> }

const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/

async function handle(request: NextRequest, context: RouteContext, method: CiunacProxyMethod) {
  return handleSecurityRoute('security.bff.request.failed', async () => {
    const { path: segments } = await context.params
    if (!segments.length || segments.some((segment) => !SAFE_SEGMENT.test(segment))) {
      throw new SecurityError('INVALID_REQUEST', 400, 'Invalid API path')
    }

    const path = segments.join('/')
    const operation = resolveCiunacProxyOperation(method, path)
    if (!operation) throw new SecurityError('FORBIDDEN', 403, 'API operation is not allowed')

    const verified = readVerifiedSessionFromRequest(request)
    const consultation = readConsultationSessionFromRequest(request)
    assertCiunacProxyAccess(operation, verified, consultation)
    if (method !== 'GET') assertTrustedOrigin(request)

    const body = await validateCiunacProxyBody(request, method, operation, verified)
    const data = await ciunacRequest<unknown>(path, { method, body })
    validateCiunacProxyResponse(operation, data, verified)

    return data === null
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(data)
  })
}

export function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context, 'GET')
}

export function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context, 'POST')
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, context, 'PATCH')
}

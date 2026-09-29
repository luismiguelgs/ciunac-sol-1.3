import 'server-only'

import type {
  ConsultationType,
  OtpPurpose,
} from '@/modules/security/domain/security.types'
import type {
  ConsultationSession,
  VerifiedSession,
} from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'

export type CiunacProxyMethod = 'GET' | 'POST' | 'PATCH'

export type CiunacProxyOperation =
  | 'student.read'
  | 'student.write'
  | 'location.duplicate.read'
  | 'request.create'
  | 'request.cargo.read'
  | 'scholarship.create'
  | 'new-student.create'
  | 'voucher.upload'
  | 'identity-document.upload'
  | 'academic-document.upload'
  | 'digital-document.read'
  | 'digital-document.accept'

type CiunacProxyAuthorization = {
  verifiedPurpose: OtpPurpose | null
  consultationType: ConsultationType | null
}

const REQUEST_PURPOSES = new Set<OtpPurpose>(['CERTIFICADO', 'CONSTANCIA', 'UBICACION'])

export function resolveCiunacProxyOperation(
  method: CiunacProxyMethod,
  path: string,
): CiunacProxyOperation | null {
  if (method === 'GET' && /^estudiantes\/buscar\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'student.read'
  }
  if (method === 'GET' && /^solicitudes\/documento\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'location.duplicate.read'
  }
  if (method === 'GET' && /^solicitudes\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'request.cargo.read'
  }
  if (method === 'GET' && /^(certificados|constancias)\/solicitud\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'digital-document.read'
  }
  if (method === 'POST' && path === 'estudiantes') return 'student.write'
  if (method === 'PATCH' && /^estudiantes\/[A-Za-z0-9_-]+$/.test(path)) return 'student.write'
  if (method === 'POST' && path === 'solicitudes') return 'request.create'
  if (method === 'POST' && path === 'solicitudbecas') return 'scholarship.create'
  if (method === 'POST' && path === 'q10/estudiantes') return 'new-student.create'
  if (method === 'POST' && path === 'upload/vouchers') return 'voucher.upload'
  if (method === 'POST' && path === 'upload/dnis') return 'identity-document.upload'
  if (method === 'POST' && path === 'upload/becas') return 'academic-document.upload'
  if (method === 'PATCH' && /^(certificados|constancias)\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'digital-document.accept'
  }

  return null
}

export function assertCiunacProxyAccess(
  operation: CiunacProxyOperation,
  verified: VerifiedSession | null,
  consultation: ConsultationSession | null,
): void {
  const sessionKind = getCiunacProxySessionKind(operation)
  const hasRequiredSession = sessionKind === 'verified' ? Boolean(verified) : Boolean(consultation)
  if (!hasRequiredSession) {
    throw new SecurityError('UNAUTHORIZED', 401, 'The required session is missing')
  }

  if (!isCiunacProxyOperationAuthorized(operation, {
    verifiedPurpose: verified?.purpose ?? null,
    consultationType: consultation?.type ?? null,
  })) {
    throw new SecurityError('FORBIDDEN', 403, 'The session cannot perform this operation')
  }
}

export function isRequestTypeAllowedForPurpose(typeId: number, purpose: OtpPurpose): boolean {
  if (purpose === 'CERTIFICADO') return typeId >= 1 && typeId <= 4
  if (purpose === 'CONSTANCIA') return typeId === 5 || typeId === 6
  if (purpose === 'UBICACION') return typeId === 7
  return false
}

export function getCiunacProxySessionKind(
  operation: CiunacProxyOperation,
): 'verified' | 'consultation' {
  return operation === 'digital-document.read' || operation === 'digital-document.accept'
    ? 'consultation'
    : 'verified'
}

export function isCiunacProxyOperationAuthorized(
  operation: CiunacProxyOperation,
  authorization: CiunacProxyAuthorization,
): boolean {
  if (getCiunacProxySessionKind(operation) === 'consultation') {
    return authorization.consultationType === 'CERTIFICADO'
  }

  const purpose = authorization.verifiedPurpose
  if (!purpose) return false

  switch (operation) {
    case 'student.read':
    case 'student.write':
    case 'request.create':
    case 'request.cargo.read':
    case 'voucher.upload':
      return REQUEST_PURPOSES.has(purpose)
    case 'location.duplicate.read':
    case 'identity-document.upload':
      return purpose === 'UBICACION'
    case 'academic-document.upload':
      return purpose === 'BECA' || purpose === 'UBICACION'
    case 'scholarship.create':
      return purpose === 'BECA'
    case 'new-student.create':
      return purpose === 'NUEVO'
    default:
      return false
  }
}

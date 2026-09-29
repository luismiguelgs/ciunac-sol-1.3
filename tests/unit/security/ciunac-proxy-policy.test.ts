import { describe, expect, it } from 'vitest'
import type { ConsultationType, OtpPurpose } from '@/modules/security/domain/security.types'
import {
  getCiunacProxySessionKind,
  isCiunacProxyOperationAuthorized,
  isRequestTypeAllowedForPurpose,
  resolveCiunacProxyOperation,
  type CiunacProxyOperation,
} from '@/app/api/ciunac/proxy-policy'

describe('strict CIUNAC proxy operation policy', () => {
  it.each([
    ['GET', 'estudiantes/buscar/12345678', 'student.read'],
    ['GET', 'solicitudes/documento/12345678', 'location.duplicate.read'],
    ['GET', 'solicitudes/1001', 'request.cargo.read'],
    ['GET', 'certificados/solicitud/1001', 'digital-document.read'],
    ['GET', 'constancias/solicitud/1003', 'digital-document.read'],
    ['POST', 'estudiantes', 'student.write'],
    ['PATCH', 'estudiantes/student-1', 'student.write'],
    ['POST', 'solicitudes', 'request.create'],
    ['POST', 'solicitudbecas', 'scholarship.create'],
    ['POST', 'q10/estudiantes', 'new-student.create'],
    ['POST', 'upload/vouchers', 'voucher.upload'],
    ['POST', 'upload/dnis', 'identity-document.upload'],
    ['POST', 'upload/becas', 'academic-document.upload'],
    ['PATCH', 'certificados/CERT-E2E', 'digital-document.accept'],
    ['PATCH', 'constancias/CONST-E2E', 'digital-document.accept'],
  ] as const)('maps %s %s to %s', (method, path, expected) => {
    expect(resolveCiunacProxyOperation(method, path)).toBe(expected)
  })

  it.each([
    ['GET', 'tipossolicitud'],
    ['GET', 'textos'],
    ['GET', 'certificados/CERT-E2E'],
    ['GET', 'constancias/CONST-E2E'],
    ['GET', 'detallesubicacion/estudiante/documento/12345678'],
    ['GET', 'mailer'],
    ['POST', 'mailer'],
    ['GET', 'ruta/no-permitida'],
    ['POST', 'upload/otro'],
    ['PATCH', 'solicitudes/1001'],
  ] as const)('rejects unused or unsupported operation %s %s', (method, path) => {
    expect(resolveCiunacProxyOperation(method, path)).toBeNull()
  })

  it.each([
    ['student.read', 'CERTIFICADO', null, true],
    ['student.write', 'CONSTANCIA', null, true],
    ['request.create', 'UBICACION', null, true],
    ['request.cargo.read', 'BECA', null, false],
    ['location.duplicate.read', 'CERTIFICADO', null, false],
    ['location.duplicate.read', 'UBICACION', null, true],
    ['identity-document.upload', 'UBICACION', null, true],
    ['identity-document.upload', 'CONSTANCIA', null, false],
    ['academic-document.upload', 'BECA', null, true],
    ['academic-document.upload', 'UBICACION', null, true],
    ['scholarship.create', 'BECA', null, true],
    ['scholarship.create', 'CERTIFICADO', null, false],
    ['new-student.create', 'NUEVO', null, true],
    ['new-student.create', 'BECA', null, false],
    ['digital-document.read', null, 'CERTIFICADO', true],
    ['digital-document.accept', null, 'EXAMEN', false],
  ] as const)(
    'authorizes %s for verified=%s consultation=%s as %s',
    (operation, verifiedPurpose, consultationType, expected) => {
      expect(isCiunacProxyOperationAuthorized(operation as CiunacProxyOperation, {
        verifiedPurpose: verifiedPurpose as OtpPurpose | null,
        consultationType: consultationType as ConsultationType | null,
      })).toBe(expected)
    },
  )

  it('distinguishes verified and consultation operations', () => {
    expect(getCiunacProxySessionKind('request.create')).toBe('verified')
    expect(getCiunacProxySessionKind('digital-document.read')).toBe('consultation')
  })

  it.each([
    [1, 'CERTIFICADO', true],
    [4, 'CERTIFICADO', true],
    [5, 'CERTIFICADO', false],
    [5, 'CONSTANCIA', true],
    [6, 'CONSTANCIA', true],
    [7, 'CONSTANCIA', false],
    [7, 'UBICACION', true],
    [1, 'UBICACION', false],
    [1, 'BECA', false],
  ] as const)('matches request type %s to purpose %s as %s', (typeId, purpose, expected) => {
    expect(isRequestTypeAllowedForPurpose(typeId, purpose)).toBe(expected)
  })
})

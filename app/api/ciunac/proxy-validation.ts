import 'server-only'

import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  isRequestTypeAllowedForPurpose,
  type CiunacProxyMethod,
  type CiunacProxyOperation,
} from '@/app/api/ciunac/proxy-policy'
import type { OtpPurpose } from '@/modules/security/domain/security.types'
import { readJsonBody } from '@/modules/security/server/request-security'
import type { VerifiedSession } from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'
import { validateVoucherUpload } from '@/modules/security/server/voucher-upload-validation'
import { MAX_VOUCHER_FILE_BYTES } from '@/modules/shared/domain/voucher-file-policy'
import {
  validateScholarshipDocumentUpload,
  validateScholarshipRequest,
} from '@/modules/solicitud-beca/server'
import { validateCertificateRequest } from '@/modules/solicitud-certificado/server'
import { validateConstanciaRequest } from '@/modules/solicitud-constancia/server'
import { validateNewStudentRequest } from '@/modules/solicitud-nuevo/server'
import {
  validateIdentityDocumentUpload,
  validateLocationRequest,
  validateLocationStudentRequest,
  validateLocationStudyCertificateUpload,
} from '@/modules/solicitud-ubicacion/server'

const MAX_UPLOAD_REQUEST_BYTES = MAX_VOUCHER_FILE_BYTES + (256 * 1024)
const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf'])
const shortText = z.string().trim().max(254)
const documentReference = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
)

const studentRequestSchema = z.object({
  nombres: shortText.min(1),
  apellidos: shortText.min(1),
  tipoDocumento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numeroDocumento: z.string().trim().min(8).max(12).regex(/^[A-Za-z0-9]+$/),
  celular: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  facultadId: z.number().int().positive().optional(),
  escuelaId: z.number().int().positive().optional(),
  codigo: shortText.optional(),
  imgDoc: documentReference.optional(),
}).strict()

const digitalAcceptanceSchema = z.object({
  aceptado: z.boolean(),
  fechaAceptacion: z.string().datetime(),
}).strict()

const requestCargoTypeSchema = z.object({
  tiposSolicitud: z.object({
    id: z.union([
      z.number().int().positive(),
      z.string().trim().regex(/^[1-9]\d*$/).transform(Number),
    ]),
  }).passthrough(),
}).passthrough()

export async function validateCiunacProxyBody(
  request: NextRequest,
  method: CiunacProxyMethod,
  operation: CiunacProxyOperation,
  verified: VerifiedSession | null,
): Promise<unknown> {
  if (method === 'GET') return undefined
  if (method === 'POST' && operation.endsWith('.upload')) {
    return readUpload(request, operation, verified?.purpose)
  }

  const value = await readJsonBody(request)
  if (operation === 'digital-document.accept') {
    return parseOrReject(digitalAcceptanceSchema, value, 'Digital document status is invalid')
  }
  const session = requireVerifiedSession(verified)

  switch (operation) {
    case 'student.write':
      if (session.purpose === 'UBICACION') {
        return validateLocationStudentRequest(request, value, session)
      }
      return validateStudentRequest(value, session)
    case 'request.create':
      return validateRequest(request, value, session)
    case 'scholarship.create':
      return validateScholarshipRequest(value, session.email)
    case 'new-student.create':
      return validateNewStudentRequest(value, session)
    default:
      throw new SecurityError('FORBIDDEN', 403, 'API operation does not accept a body')
  }
}

export function validateCiunacProxyResponse(
  operation: CiunacProxyOperation,
  value: unknown,
  verified: VerifiedSession | null,
): void {
  if (operation !== 'request.cargo.read') return
  const session = requireVerifiedSession(verified)
  const result = requestCargoTypeSchema.safeParse(value)
  if (!result.success) {
    throw new SecurityError('UPSTREAM_ERROR', 502, 'Request cargo response is invalid')
  }
  if (!isRequestTypeAllowedForPurpose(result.data.tiposSolicitud.id, session.purpose)) {
    throw new SecurityError('FORBIDDEN', 403, 'Request cargo does not belong to this flow')
  }
}

async function validateRequest(
  request: NextRequest,
  value: unknown,
  session: VerifiedSession,
): Promise<unknown> {
  const typeId = readRequestTypeId(value, session.purpose)
  if (!isRequestTypeAllowedForPurpose(typeId, session.purpose)) {
    throw new SecurityError('FORBIDDEN', 403, 'Session cannot create this request type')
  }

  if (session.purpose === 'CERTIFICADO') return validateCertificateRequest(value)
  if (session.purpose === 'CONSTANCIA') return validateConstanciaRequest(value)
  if (session.purpose === 'UBICACION') return validateLocationRequest(request, value, session)
  throw new SecurityError('FORBIDDEN', 403, 'Session cannot create requests')
}

function validateStudentRequest(value: unknown, session: VerifiedSession) {
  const student = parseOrReject(studentRequestSchema, value, 'Student payload is invalid')
  assertVerifiedEmail(student.email, session)
  return student
}

function assertVerifiedEmail(email: string, session: VerifiedSession): void {
  if (email.trim().toLowerCase() !== session.email.toLowerCase()) {
    throw new SecurityError('FORBIDDEN', 403, 'Email does not match verified session')
  }
}

function readRequestTypeId(value: unknown, purpose: OtpPurpose): number {
  if (!value || typeof value !== 'object') return Number.NaN
  const request = purpose === 'UBICACION' && 'request' in value
    ? (value as { request?: unknown }).request
    : value
  if (!request || typeof request !== 'object') return Number.NaN
  return Number((request as { tipoSolicitudId?: unknown }).tipoSolicitudId)
}

async function readUpload(
  request: NextRequest,
  operation: CiunacProxyOperation,
  purpose: OtpPurpose | undefined,
): Promise<FormData> {
  const contentType = request.headers.get('content-type') ?? ''
  const contentLength = Number(request.headers.get('content-length') ?? '0')

  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    throw new SecurityError('INVALID_REQUEST', 415, 'A multipart request is required')
  }
  if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_REQUEST_BYTES) {
    throw new SecurityError('INVALID_REQUEST', 413, 'Upload is too large')
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size <= 0 || file.size > MAX_VOUCHER_FILE_BYTES || !ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Upload file is invalid')
  }

  if (operation === 'voucher.upload') await validateVoucherUpload(formData)
  if (operation === 'identity-document.upload') await validateIdentityDocumentUpload(formData)
  if (operation === 'academic-document.upload') {
    if (purpose === 'UBICACION') await validateLocationStudyCertificateUpload(formData)
    else if (purpose === 'BECA') await validateScholarshipDocumentUpload(formData)
    else throw new SecurityError('FORBIDDEN', 403, 'This document upload is not allowed')
  }

  return formData
}

function requireVerifiedSession(session: VerifiedSession | null): VerifiedSession {
  if (!session) throw new SecurityError('UNAUTHORIZED', 401, 'Verified session is required')
  return session
}

function parseOrReject<T>(schema: z.ZodType<T>, value: unknown, message: string): T {
  const result = schema.safeParse(value)
  if (!result.success) throw new SecurityError('INVALID_REQUEST', 400, message)
  return result.data
}

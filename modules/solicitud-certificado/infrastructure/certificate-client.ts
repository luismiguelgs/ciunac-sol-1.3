import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { apiFetch, apiFetchOptional } from '@/lib/api.service'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type {
  CertificateCargo,
  CertificateStudentLookup,
  SolicitudCertificado,
} from '../model'
import {
  toCertificateCargo,
  toCertificateRequestDto,
  toCertificateStudentLookup,
  toCertificateStudentRequestDto,
} from './certificate-api.mapper'
import {
  certificateCargoResponseSchema,
  certificateCreateResponseSchema,
  certificateStudentLookupResponseSchema,
  certificateStudentResponseSchema,
} from './certificate-api.schemas'

export async function saveCertificateStudent(solicitud: SolicitudCertificado): Promise<string> {
  try {
    const body = toCertificateStudentRequestDto(solicitud)
    const response = solicitud.basicData.existingStudentId
      ? await apiFetch<unknown>(`estudiantes/${solicitud.basicData.existingStudentId}`, 'PATCH', body)
      : await apiFetch<unknown>('estudiantes', 'POST', body)
    return parseExternalResponse(
      certificateStudentResponseSchema,
      response,
      'No se pudo confirmar el identificador del estudiante.',
    ).id
  } catch (error) {
    throw normalizeAppError(error, 'No se pudo guardar la informacion del estudiante')
  }
}

export async function createCertificateRequest(solicitud: SolicitudCertificado, studentId: string): Promise<string> {
  try {
    const body = toCertificateRequestDto(solicitud, studentId)
    const response = await apiFetch<unknown>('solicitudes', 'POST', body)
    return parseExternalResponse(
      certificateCreateResponseSchema,
      response,
      'No se pudo confirmar el identificador de la solicitud.',
    ).id
  } catch (error) {
    throw normalizeAppError(error, 'No se pudo guardar la solicitud')
  }
}

export async function sendCertificateNotification(requestId: string): Promise<string> {
  try {
    return await mailApiRepository.send({ type: 'CERTIFICADO', reference: requestId })
  } catch (error) {
    throw normalizeAppError(error, 'La solicitud se guardo, pero el correo no pudo enviarse')
  }
}

export async function fetchCertificateStudent(documentNumber: string): Promise<CertificateStudentLookup | null> {
  const response = await apiFetchOptional<unknown>(`estudiantes/buscar/${documentNumber}`, 'GET')
  if (response === null) return null
  return toCertificateStudentLookup(parseExternalResponse(
    certificateStudentLookupResponseSchema,
    response,
    'La API devolvio datos de estudiante incompletos.',
  ))
}

export async function fetchCertificateCargo(requestId: number): Promise<CertificateCargo | null> {
  const response = await apiFetchOptional<unknown>(`solicitudes/${requestId}`, 'GET')
  if (response === null) return null
  return toCertificateCargo(parseExternalResponse(
    certificateCargoResponseSchema,
    response,
    'La API devolvio datos incompletos para el cargo de certificado.',
  ))
}

import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { apiFetch, apiFetchOptional } from '@/lib/api.service'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { ConstanciaCargo, ConstanciaStudentLookup, SolicitudConstancia } from '../model'
import {
  toConstanciaCargo,
  toConstanciaRequestDto,
  toConstanciaStudentLookup,
  toConstanciaStudentRequestDto,
} from './constancia-api.mapper'
import {
  constanciaCargoResponseSchema,
  constanciaCreateResponseSchema,
  constanciaStudentLookupResponseSchema,
  constanciaStudentResponseSchema,
} from './constancia-api.schemas'

export async function saveConstanciaStudent(solicitud: SolicitudConstancia): Promise<string> {
  try {
    const body = toConstanciaStudentRequestDto(solicitud)
    const response = solicitud.basicData.existingStudentId
      ? await apiFetch<unknown>(`estudiantes/${solicitud.basicData.existingStudentId}`, 'PATCH', body)
      : await apiFetch<unknown>('estudiantes', 'POST', body)
    return parseExternalResponse(
      constanciaStudentResponseSchema,
      response,
      'No se pudo confirmar el identificador del estudiante.',
    ).id
  } catch (error) {
    throw normalizeAppError(error, 'No se pudo guardar la informacion del estudiante.')
  }
}

export async function createConstanciaRequest(solicitud: SolicitudConstancia, studentId: string): Promise<string> {
  try {
    const body = toConstanciaRequestDto(solicitud, studentId)
    const response = await apiFetch<unknown>('solicitudes', 'POST', body)
    return parseExternalResponse(
      constanciaCreateResponseSchema,
      response,
      'No se pudo confirmar el identificador de la solicitud.',
    ).id
  } catch (error) {
    throw normalizeAppError(error, 'No se pudo guardar la solicitud de constancia.')
  }
}

export async function sendConstanciaNotification(requestId: string): Promise<string> {
  try {
    return await mailApiRepository.send({ type: 'CONSTANCIA', reference: requestId })
  } catch (error) {
    throw normalizeAppError(error, 'La solicitud se guardo, pero el correo no pudo procesarse.')
  }
}

export async function fetchConstanciaStudent(documentNumber: string): Promise<ConstanciaStudentLookup | null> {
  const response = await apiFetchOptional<unknown>(`estudiantes/buscar/${documentNumber}`, 'GET')
  if (response === null) return null
  return toConstanciaStudentLookup(parseExternalResponse(
    constanciaStudentLookupResponseSchema,
    response,
    'La API devolvio datos de estudiante incompletos.',
  ))
}

export async function fetchConstanciaCargo(requestId: number): Promise<ConstanciaCargo | null> {
  const response = await apiFetchOptional<unknown>(`solicitudes/${requestId}`, 'GET')
  if (response === null) return null
  return toConstanciaCargo(parseExternalResponse(
    constanciaCargoResponseSchema,
    response,
    'La API devolvio datos incompletos para el cargo de constancia.',
  ))
}

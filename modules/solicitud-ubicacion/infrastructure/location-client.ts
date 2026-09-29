import { requestJsonResult } from '@/modules/shared/infrastructure/http/browser-http'
import { apiFetch, apiFetchOptional } from '@/lib/api.service'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { SolicitudUbicacion } from '../model'
import {
  toExistingLocationRequest, toLocationCargo, toLocationRequestDto,
  toLocationStudentLookup, toLocationStudentRequestDto,
} from './location-api.mapper'
import {
  locationCargoResponseSchema, locationCreateResponseSchema, locationDuplicateResponseArraySchema,
  locationStudentLookupResponseSchema, locationStudentResponseSchema, type LocationCreateCommandDto,
} from './location-api.schemas'

export async function saveLocationStudent(solicitud: SolicitudUbicacion): Promise<string> {
  const body = toLocationStudentRequestDto(solicitud)
  const response = solicitud.basicData.existingStudentId
    ? await apiFetch<unknown>(`estudiantes/${solicitud.basicData.existingStudentId}`, 'PATCH', body)
    : await apiFetch<unknown>('estudiantes', 'POST', body)
  return parseExternalResponse(locationStudentResponseSchema, response,
    'No se pudo confirmar el identificador del estudiante.').id
}

export async function findStudentByDocument(documentNumber: string) {
  const response = await apiFetchOptional<unknown>(`estudiantes/buscar/${documentNumber}`, 'GET')
  if (response === null) return null
  return toLocationStudentLookup(parseExternalResponse(locationStudentLookupResponseSchema, response,
    'La API devolvio datos de estudiante incompletos.'))
}

export async function createLocationRequest(solicitud: SolicitudUbicacion, studentId: string): Promise<string> {
  const body: LocationCreateCommandDto = {
    documentNumber: solicitud.basicData.documentNumber,
    request: toLocationRequestDto(solicitud, studentId),
  }
  const response = await apiFetch<unknown>('solicitudes', 'POST', body)
  return parseExternalResponse(locationCreateResponseSchema, response,
    'No se pudo confirmar el identificador de la solicitud.').id
}

export async function findLocationRequests(documentNumber: string) {
  const response = await apiFetch<unknown>(`solicitudes/documento/${documentNumber}`, 'GET')
  return parseExternalResponse(locationDuplicateResponseArraySchema, response,
    'La API devolvio solicitudes existentes incompletas.').map(toExistingLocationRequest)
}

export async function findCargoById(requestId: number) {
  const response = await apiFetchOptional<unknown>(`solicitudes/${requestId}`, 'GET')
  if (response === null) return null
  return toLocationCargo(parseExternalResponse(locationCargoResponseSchema, response,
    'La API devolvio datos incompletos para el cargo de ubicacion.'))
}

export function sendLocationNotification(requestId: string): Promise<string> {
  return mailApiRepository.send({ type: 'UBICACION', reference: requestId })
}

export async function saveLocationProfile(isCiunacStudent: boolean): Promise<void> {
  const result = await requestJsonResult('/api/security/ubicacion/profile', 'POST', { isCiunacStudent })
  if (!result.ok) throw result.error
}

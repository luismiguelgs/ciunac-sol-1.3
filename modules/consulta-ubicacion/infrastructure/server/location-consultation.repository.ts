import 'server-only'

import type {
  LocationContext,
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
} from '../../model'
import {
  toLocationCycle,
  toLocationExam,
  toLocationPlacementRecord,
  toLocationRequest,
  toLocationText,
} from '../location-consultation.mapper'
import {
  locationCycleArrayResponseSchema,
  locationExamArrayResponseSchema,
  locationPlacementArrayResponseSchema,
} from '../location-consultation.schemas'
import { getConsultationRequests } from '@/modules/consultas/server'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export async function loadLocationContext(documentNumber: string): Promise<LocationContext> {
  const result = await getConsultationRequests({
    documentNumber,
    type: 'EXAMEN',
  })

  return {
    requests: result.requests.flatMap((request) => {
      const mapped = toLocationRequest(request)
      return mapped ? [mapped] : []
    }),
    texts: result.texts.map(toLocationText),
    textStatus: result.textStatus,
  }
}

export async function findLocationPlacements(documentNumber: string): Promise<LocationPlacementRecord[]> {
  const response = await ciunacRequest<unknown>(`detallesubicacion/estudiante/documento/${documentNumber}`)
  if (response === null) return []
  const dtos = parseExternalResponse(
    locationPlacementArrayResponseSchema,
    response,
    'La API devolvió resultados de ubicación incompletos o no válidos.',
  )
  return dtos.map(toLocationPlacementRecord)
}

export async function listLocationExams(): Promise<LocationExam[]> {
  const response = await ciunacRequest<unknown>('examenesubicacion')
  if (response === null) return []
  const dtos = parseExternalResponse(
    locationExamArrayResponseSchema,
    response,
    'La API devolvió exámenes de ubicación incompletos o no válidos.',
  )
  return dtos.map(toLocationExam)
}

export async function listLocationCycles(): Promise<LocationCycle[]> {
  const response = await ciunacRequest<unknown>('ciclos')
  if (response === null) return []
  const dtos = parseExternalResponse(
    locationCycleArrayResponseSchema,
    response,
    'La API devolvió ciclos incompletos o no válidos.',
  )
  return dtos.map(toLocationCycle)
}

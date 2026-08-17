import 'server-only'

import type {
  LocationContextPort,
  LocationCyclePort,
  LocationExamPort,
  LocationPlacementPort,
} from '@/modules/consulta-ubicacion/application/ports/location-consultation.port'
import type {
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import {
  toLocationCycle,
  toLocationExam,
  toLocationPlacementRecord,
  toLocationRequest,
  toLocationText,
} from '@/modules/consulta-ubicacion/infrastructure/mappers/location-consultation.mapper'
import {
  locationCycleArrayResponseSchema,
  locationExamArrayResponseSchema,
  locationPlacementArrayResponseSchema,
} from '@/modules/consulta-ubicacion/infrastructure/validation/location-consultation.schemas'
import { getConsultationRequests } from '@/modules/consultas/server'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export class ServerLocationContextRepository implements LocationContextPort {
  async load(documentNumber: string): ReturnType<LocationContextPort['load']> {
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
}

export class ServerLocationPlacementRepository implements LocationPlacementPort {
  async findByDocument(documentNumber: string): Promise<LocationPlacementRecord[]> {
    const response = await ciunacRequest<unknown>(`detallesubicacion/estudiante/documento/${documentNumber}`)
    if (response === null) return []
    const dtos = parseExternalResponse(
      locationPlacementArrayResponseSchema,
      response,
      'La API devolvió resultados de ubicación incompletos o no válidos.',
    )
    return dtos.map(toLocationPlacementRecord)
  }
}

export class ServerLocationExamRepository implements LocationExamPort {
  async list(): Promise<LocationExam[]> {
    const response = await ciunacRequest<unknown>('examenesubicacion')
    if (response === null) return []
    const dtos = parseExternalResponse(
      locationExamArrayResponseSchema,
      response,
      'La API devolvió exámenes de ubicación incompletos o no válidos.',
    )
    return dtos.map(toLocationExam)
  }
}

export class ServerLocationCycleRepository implements LocationCyclePort {
  async list(): Promise<LocationCycle[]> {
    const response = await ciunacRequest<unknown>('ciclos')
    if (response === null) return []
    const dtos = parseExternalResponse(
      locationCycleArrayResponseSchema,
      response,
      'La API devolvió ciclos incompletos o no válidos.',
    )
    return dtos.map(toLocationCycle)
  }
}

export const serverLocationContextRepository = new ServerLocationContextRepository()
export const serverLocationPlacementRepository = new ServerLocationPlacementRepository()
export const serverLocationExamRepository = new ServerLocationExamRepository()
export const serverLocationCycleRepository = new ServerLocationCycleRepository()

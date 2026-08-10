import 'server-only'

import {
  LocationCyclePort,
  LocationExamPort,
  LocationPlacementPort,
} from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import {
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import {
  toLocationCycle,
  toLocationExam,
  toLocationPlacementRecord,
} from '@/modules/consulta-ubicacion/infrastructure/mappers/location-consultation.mapper'
import {
  locationCycleArrayResponseSchema,
  locationExamArrayResponseSchema,
  locationPlacementArrayResponseSchema,
} from '@/modules/consulta-ubicacion/infrastructure/validation/location-consultation.schemas'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export class ServerLocationPlacementRepository implements LocationPlacementPort {
  async findByDocument(documentNumber: string): Promise<LocationPlacementRecord[]> {
    const response = await ciunacRequest<unknown>(`detallesubicacion/estudiante/documento/${documentNumber}`)
    if (response === null) return []
    const dtos = parseExternalResponse(
      locationPlacementArrayResponseSchema,
      response,
      'La API devolvio resultados de ubicacion incompletos o no validos.',
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
      'La API devolvio examenes de ubicacion incompletos o no validos.',
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
      'La API devolvio ciclos incompletos o no validos.',
    )
    return dtos.map(toLocationCycle)
  }
}

export const serverLocationPlacementRepository = new ServerLocationPlacementRepository()
export const serverLocationExamRepository = new ServerLocationExamRepository()
export const serverLocationCycleRepository = new ServerLocationCycleRepository()

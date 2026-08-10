import 'server-only'

import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { ConsultedRequest } from '@/modules/consultas/domain/consulted-request'
import { ConsultationText } from '@/modules/consultas/domain/consultation-text'
import { ConsultationRequestPort, ConsultationTextPort } from '@/modules/consultas/application/get-consultation-requests.use-case'
import { toConsultationText, toConsultedRequest } from '@/modules/consultas/infrastructure/mappers/consultation.mapper'
import {
  consultationTextArrayResponseSchema,
  consultedRequestArrayResponseSchema,
} from '@/modules/consultas/infrastructure/validation/consultation.schemas'

export class ServerConsultationRequestRepository implements ConsultationRequestPort {
  async findByDocument(documentNumber: string): Promise<ConsultedRequest[]> {
    const response = await ciunacRequest<unknown>(`solicitudes/documento/${documentNumber}`)
    if (response === null) return []
    const dtos = parseExternalResponse(
      consultedRequestArrayResponseSchema,
      response,
      'La API devolvio solicitudes incompletas o no validas.',
    )
    return dtos.map(toConsultedRequest)
  }
}

export class ServerConsultationTextRepository implements ConsultationTextPort {
  async list(): Promise<ConsultationText[]> {
    const response = await ciunacRequest<unknown>('textos')
    if (response === null) return []
    const dtos = parseExternalResponse(
      consultationTextArrayResponseSchema,
      response,
      'La API devolvio textos de consulta no validos.',
    )
    return dtos.map(toConsultationText)
  }
}

export const serverConsultationRequestRepository = new ServerConsultationRequestRepository()
export const serverConsultationTextRepository = new ServerConsultationTextRepository()

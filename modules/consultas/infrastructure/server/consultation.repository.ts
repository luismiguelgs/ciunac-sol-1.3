import 'server-only'

import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import type { ConsultedRequest, ConsultationText } from '../../model'
import { toConsultationText, toConsultedRequest } from '../consultation.mapper'
import {
  consultationTextArrayResponseSchema,
  consultedRequestArrayResponseSchema,
} from '../consultation.schemas'

export async function findRequestsByDocument(documentNumber: string): Promise<ConsultedRequest[]> {
  const response = await ciunacRequest<unknown>(`solicitudes/documento/${documentNumber}`)
  if (response === null) return []
  const dtos = parseExternalResponse(
    consultedRequestArrayResponseSchema,
    response,
    'La API devolvio solicitudes incompletas o no validas.',
  )
  return dtos.map(toConsultedRequest)
}

export async function listConsultationTexts(): Promise<ConsultationText[]> {
  const response = await ciunacRequest<unknown>('textos')
  if (response === null) return []
  const dtos = parseExternalResponse(
    consultationTextArrayResponseSchema,
    response,
    'La API devolvio textos de consulta no validos.',
  )
  return dtos.map(toConsultationText)
}

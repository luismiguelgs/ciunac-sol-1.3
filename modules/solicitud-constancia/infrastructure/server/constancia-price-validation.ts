import { sameMoney } from '@/modules/shared/domain/payment'
import 'server-only'

import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { SecurityError } from '@/modules/security/server/security-error'
import { isConstanciaType } from '../../model'
import {
  type ConstanciaRequestDto,
  constanciaRequestDtoSchema,
  constanciaTypeArraySchema,
} from '../constancia-api.schemas'

export async function validateConstanciaRequest(value: unknown): Promise<ConstanciaRequestDto> {
  const typeId = readTypeId(value)
  if (!isConstanciaType(typeId)) {
    throw new SecurityError('FORBIDDEN', 403, 'Constancia session cannot create this request type')
  }

  const requestResult = constanciaRequestDtoSchema.safeParse(value)
  if (!requestResult.success) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Constancia request payload is invalid')
  }

  const catalogResponse = await ciunacRequest<unknown>('tipossolicitud')
  const catalogResult = constanciaTypeArraySchema.safeParse(catalogResponse)
  if (!catalogResult.success) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'Constancia price catalog is unavailable')
  }

  const selectedType = catalogResult.data.find((item) => item.id === requestResult.data.tipoSolicitudId)
  if (!selectedType) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'Constancia price is unavailable')
  }
  if (!sameMoney(requestResult.data.pago, selectedType.precio)) {
    throw new SecurityError('PRICE_CHANGED', 409, 'Constancia price does not match current catalog')
  }

  return requestResult.data
}

function readTypeId(value: unknown): number {
  if (!value || typeof value !== 'object') return Number.NaN
  return Number((value as { tipoSolicitudId?: unknown }).tipoSolicitudId)
}

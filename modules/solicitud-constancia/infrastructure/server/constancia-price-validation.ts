import 'server-only'

import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { SecurityError } from '@/modules/security/server/security-error'
import { isConstanciaType } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import {
  constanciaRequestDtoSchema,
  constanciaTypeArraySchema,
} from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

export async function validateConstanciaRequestPrice(value: unknown): Promise<void> {
  const typeId = readTypeId(value)
  if (!isConstanciaType(typeId)) return

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
}

function readTypeId(value: unknown): number {
  if (!value || typeof value !== 'object') return Number.NaN
  return Number((value as { tipoSolicitudId?: unknown }).tipoSolicitudId)
}

function sameMoney(left: number, right: number): boolean {
  return Math.round(left * 100) === Math.round(right * 100)
}

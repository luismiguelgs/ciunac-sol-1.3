import { sameMoney } from '@/modules/shared/domain/payment'
import 'server-only'

import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { SecurityError } from '@/modules/security/server/security-error'
import { isCertificateType } from '../../model'
import {
  certificateRequestDtoSchema,
  certificateTypeArraySchema,
  type CertificateRequestDto,
} from '../certificate-api.schemas'

export async function validateCertificateRequest(value: unknown): Promise<CertificateRequestDto> {
  const typeId = readTypeId(value)
  if (!isCertificateType(typeId)) {
    throw new SecurityError('FORBIDDEN', 403, 'Certificate session cannot create this request type')
  }

  const requestResult = certificateRequestDtoSchema.safeParse(value)
  if (!requestResult.success) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Certificate request payload is invalid')
  }

  const catalogResponse = await ciunacRequest<unknown>('tipossolicitud')
  const catalogResult = certificateTypeArraySchema.safeParse(catalogResponse)
  if (!catalogResult.success) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'Certificate price catalog is unavailable')
  }

  const selectedType = catalogResult.data.find((item) => item.id === requestResult.data.tipoSolicitudId)
  if (!selectedType) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'Certificate price is unavailable')
  }
  if (!sameMoney(requestResult.data.pago, selectedType.precio)) {
    throw new SecurityError('PRICE_CHANGED', 409, 'Certificate price does not match current catalog')
  }

  return requestResult.data
}

function readTypeId(value: unknown): number {
  if (!value || typeof value !== 'object') return Number.NaN
  return Number((value as { tipoSolicitudId?: unknown }).tipoSolicitudId)
}

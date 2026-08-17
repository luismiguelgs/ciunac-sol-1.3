import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { CertificateCargoPort } from '@/modules/solicitud-certificado/application/ports/certificate-read.ports'
import type { CertificateCargo } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { toCertificateCargo } from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import { certificateCargoResponseSchema } from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'

export class CertificateCargoApiGateway implements CertificateCargoPort {
  async findById(requestId: number): Promise<CertificateCargo | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`solicitudes/${requestId}`)
    if (response === null) return null
    const dto = parseExternalResponse(
      certificateCargoResponseSchema,
      response,
      'La API devolvio datos incompletos para el cargo de certificado.',
    )
    return toCertificateCargo(dto)
  }
}

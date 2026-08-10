import 'server-only'

import { CertificateDetailPort } from '@/modules/consulta-certificado/application/get-certificate-detail.use-case'
import { CertificateDetail } from '@/modules/consulta-certificado/domain/certificate-detail'
import { toCertificateDetail } from '@/modules/consulta-certificado/infrastructure/mappers/certificate-detail.mapper'
import { certificateDetailResponseSchema } from '@/modules/consulta-certificado/infrastructure/validation/certificate-detail.schemas'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { SecurityError } from '@/modules/security/server/security-error'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export class ServerCertificateDetailRepository implements CertificateDetailPort {
  async findById(id: string): Promise<CertificateDetail | null> {
    let response: unknown
    try {
      response = await ciunacRequest<unknown>(`certificados/${id}`)
    } catch (error) {
      if (error instanceof SecurityError && error.status === 404) return null
      throw error
    }

    if (response === null) return null

    const dto = parseExternalResponse(
      certificateDetailResponseSchema,
      response,
      'La API devolvio un certificado incompleto o no valido.',
    )
    return toCertificateDetail(dto)
  }
}

export const serverCertificateDetailRepository = new ServerCertificateDetailRepository()

import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { CertificateStudentLookup } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { toCertificateStudentLookup } from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import { certificateStudentLookupResponseSchema } from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'

export class CertificateStudentRepository {
  async findByDocument(documentNumber: string): Promise<CertificateStudentLookup | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`estudiantes/buscar/${documentNumber}`)
    if (response === null) return null
    const dto = parseExternalResponse(
      certificateStudentLookupResponseSchema,
      response,
      'La API devolvio datos de estudiante incompletos.',
    )
    return toCertificateStudentLookup(dto)
  }
}

export const certificateStudentRepository = new CertificateStudentRepository()

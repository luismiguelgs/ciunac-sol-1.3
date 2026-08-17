import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { CertificateStudentLookupPort } from '@/modules/solicitud-certificado/application/ports/certificate-read.ports'
import type { StudentGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports'
import type {
  CertificateStudentLookup,
  SolicitudCertificado,
} from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import type { CertificateStudentRequestDto } from '@/modules/solicitud-certificado/infrastructure/dto/certificate-request.dto'
import {
  toCertificateStudentLookup,
  toCertificateStudentRequestDto,
} from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import {
  certificateStudentLookupResponseSchema,
  certificateStudentResponseSchema,
} from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'

export class CertificateStudentApiGateway implements StudentGateway, CertificateStudentLookupPort {
  async save(solicitud: SolicitudCertificado): Promise<string> {
    try {
      const body = toCertificateStudentRequestDto(solicitud)
      const response = solicitud.basicData.existingStudentId
        ? await resourceApiRepository.update<unknown, CertificateStudentRequestDto>(
            `estudiantes/${solicitud.basicData.existingStudentId}`,
            body,
          )
        : await resourceApiRepository.create<unknown, CertificateStudentRequestDto>('estudiantes', body)
      return parseExternalResponse(
        certificateStudentResponseSchema,
        response,
        'No se pudo confirmar el identificador del estudiante.',
      ).id
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo guardar la informacion del estudiante')
    }
  }

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

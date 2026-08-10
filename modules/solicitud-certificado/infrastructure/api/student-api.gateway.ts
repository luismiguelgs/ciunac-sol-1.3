import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { StudentGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports'
import { SolicitudCertificado } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { CertificateStudentRequestDto } from '@/modules/solicitud-certificado/infrastructure/dto/certificate-api.dto'
import { toCertificateStudentRequestDto } from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import { certificateStudentResponseSchema } from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'

export class StudentApiGateway implements StudentGateway {
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
}

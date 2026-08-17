import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { SolicitudGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports'
import { SolicitudCertificado } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { CertificateRequestDto } from '@/modules/solicitud-certificado/infrastructure/dto/certificate-request.dto'
import { toCertificateRequestDto } from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import { certificateCreateResponseSchema } from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'

export class SolicitudApiGateway implements SolicitudGateway {
  async create(solicitud: SolicitudCertificado, studentId: string): Promise<string> {
    try {
      const body = toCertificateRequestDto(solicitud, studentId)
      const response = await resourceApiRepository.create<unknown, CertificateRequestDto>('solicitudes', body)
      return parseExternalResponse(
        certificateCreateResponseSchema,
        response,
        'No se pudo confirmar el identificador de la solicitud.',
      ).id
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo guardar la solicitud')
    }
  }
}

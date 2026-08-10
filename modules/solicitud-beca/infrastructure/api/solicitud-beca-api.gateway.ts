import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudBecaGateway } from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';
import { SolicitudBeca } from '@/modules/solicitud-beca/domain/solicitud-beca'
import { ScholarshipRequestDto } from '@/modules/solicitud-beca/infrastructure/dto/scholarship-api.dto'
import { toScholarshipRequestDto } from '@/modules/solicitud-beca/infrastructure/mappers/scholarship-api.mapper'
import { scholarshipCreateResponseSchema } from '@/modules/solicitud-beca/infrastructure/validation/scholarship-api.schemas'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export class SolicitudBecaApiGateway implements SolicitudBecaGateway {
  async create(solicitud: SolicitudBeca): Promise<string> {
    try {
      const body = toScholarshipRequestDto(solicitud)
      const response = await resourceApiRepository.create<unknown, ScholarshipRequestDto>('solicitudbecas', body)
      const parsed = parseExternalResponse(
        scholarshipCreateResponseSchema,
        response,
        'No se pudo confirmar el identificador de la beca.',
      )
      const requestId = parsed._id ?? parsed.id
      if (!requestId) {
        throw new AppError({
          code: 'EXTERNAL_SERVICE',
          message: 'No se pudo confirmar el identificador de la beca.',
        })
      }
      return requestId
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo guardar la solicitud de beca');
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }
}

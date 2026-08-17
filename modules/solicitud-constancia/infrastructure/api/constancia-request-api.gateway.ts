import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { ConstanciaRequestGateway } from '@/modules/solicitud-constancia/application/ports/register-solicitud-constancia.ports'
import type { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import type { ConstanciaRequestDto } from '@/modules/solicitud-constancia/infrastructure/dto/constancia-request.dto'
import { toConstanciaRequestDto } from '@/modules/solicitud-constancia/infrastructure/mappers/constancia-api.mapper'
import { constanciaCreateResponseSchema } from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

export class ConstanciaRequestApiGateway implements ConstanciaRequestGateway {
  async create(solicitud: SolicitudConstancia, studentId: string): Promise<string> {
    try {
      const body = toConstanciaRequestDto(solicitud, studentId)
      const response = await resourceApiRepository.create<unknown, ConstanciaRequestDto>('solicitudes', body)
      return parseExternalResponse(
        constanciaCreateResponseSchema,
        response,
        'No se pudo confirmar el identificador de la solicitud.',
      ).id
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo guardar la solicitud de constancia.')
    }
  }
}

import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { ConstanciaCargoPort } from '@/modules/solicitud-constancia/application/ports/constancia-read.ports'
import type { ConstanciaCargo } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { toConstanciaCargo } from '@/modules/solicitud-constancia/infrastructure/mappers/constancia-api.mapper'
import { constanciaCargoResponseSchema } from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

export class ConstanciaCargoApiGateway implements ConstanciaCargoPort {
  async findById(requestId: number): Promise<ConstanciaCargo | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`solicitudes/${requestId}`)
    if (response === null) return null
    const dto = parseExternalResponse(
      constanciaCargoResponseSchema,
      response,
      'La API devolvio datos incompletos para el cargo de constancia.',
    )
    return toConstanciaCargo(dto)
  }
}

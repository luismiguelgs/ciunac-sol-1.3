import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { LocationCargoPort } from '@/modules/solicitud-ubicacion/application/ports/location-read.ports'
import type { LocationCargo } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { toLocationCargo } from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import { locationCargoResponseSchema } from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export class LocationCargoApiGateway implements LocationCargoPort {
  async findById(requestId: number): Promise<LocationCargo | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`solicitudes/${requestId}`)
    if (response === null) return null
    const dto = parseExternalResponse(
      locationCargoResponseSchema,
      response,
      'La API devolvio datos incompletos para el cargo de ubicacion.',
    )
    return toLocationCargo(dto)
  }
}

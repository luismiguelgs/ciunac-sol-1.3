import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { LocationCargo } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { toLocationCargo } from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import { locationCargoResponseSchema } from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export class LocationCargoRepository {
  async findById(id: number): Promise<LocationCargo | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`solicitudes/${id}`)
    if (response === null) return null
    return toLocationCargo(parseExternalResponse(
      locationCargoResponseSchema,
      response,
      'La API devolvio datos incompletos para el cargo de ubicacion.',
    ))
  }
}

export const locationCargoRepository = new LocationCargoRepository()


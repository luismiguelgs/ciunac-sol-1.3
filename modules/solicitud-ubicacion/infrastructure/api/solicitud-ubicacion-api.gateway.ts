import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { SolicitudUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports'
import { SolicitudUbicacion } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { LocationCreateCommandDto } from '@/modules/solicitud-ubicacion/infrastructure/dto/location-api.dto'
import {
  toExistingLocationRequest,
  toLocationRequestDto,
} from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import {
  locationCreateResponseSchema,
  locationDuplicateResponseArraySchema,
} from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export class SolicitudUbicacionApiGateway implements SolicitudUbicacionGateway {
  async create(solicitud: SolicitudUbicacion, studentId: string): Promise<string> {
    try {
      const body: LocationCreateCommandDto = {
        documentNumber: solicitud.basicData.documentNumber,
        request: toLocationRequestDto(solicitud, studentId),
      }
      const response = await resourceApiRepository.create<unknown, LocationCreateCommandDto>('solicitudes', body)
      return parseExternalResponse(
        locationCreateResponseSchema,
        response,
        'No se pudo confirmar el identificador de la solicitud.',
      ).id
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo guardar la solicitud')
    }
  }

  async searchByDocument(documentNumber: string) {
    try {
      const response = await resourceApiRepository.get<unknown>(`solicitudes/documento/${documentNumber}`)
      return parseExternalResponse(
        locationDuplicateResponseArraySchema,
        response,
        'La API devolvio solicitudes existentes incompletas.',
      ).map(toExistingLocationRequest)
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo consultar solicitudes existentes')
    }
  }
}

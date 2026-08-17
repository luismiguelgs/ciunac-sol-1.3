import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { LocationStudentLookupPort } from '@/modules/solicitud-ubicacion/application/ports/location-read.ports'
import type { StudentUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports'
import type {
  LocationStudentLookup,
  SolicitudUbicacion,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import type { LocationStudentRequestDto } from '@/modules/solicitud-ubicacion/infrastructure/dto/location-api.dto'
import {
  toLocationStudentLookup,
  toLocationStudentRequestDto,
} from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import {
  locationStudentLookupResponseSchema,
  locationStudentResponseSchema,
} from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export class LocationStudentApiGateway implements StudentUbicacionGateway, LocationStudentLookupPort {
  async save(solicitud: SolicitudUbicacion): Promise<string> {
    try {
      const body = toLocationStudentRequestDto(solicitud)
      const response = solicitud.basicData.existingStudentId
        ? await resourceApiRepository.update<unknown, LocationStudentRequestDto>(
            `estudiantes/${solicitud.basicData.existingStudentId}`,
            body,
          )
        : await resourceApiRepository.create<unknown, LocationStudentRequestDto>('estudiantes', body)
      return parseExternalResponse(
        locationStudentResponseSchema,
        response,
        'No se pudo confirmar el identificador del estudiante.',
      ).id
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo guardar la informacion del estudiante')
    }
  }

  async findByDocument(documentNumber: string): Promise<LocationStudentLookup | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`estudiantes/buscar/${documentNumber}`)
    if (response === null) return null
    const dto = parseExternalResponse(
      locationStudentLookupResponseSchema,
      response,
      'La API devolvio datos de estudiante incompletos.',
    )
    return toLocationStudentLookup(dto)
  }
}

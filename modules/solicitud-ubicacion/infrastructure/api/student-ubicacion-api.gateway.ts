import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { StudentUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports'
import { SolicitudUbicacion } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { LocationStudentRequestDto } from '@/modules/solicitud-ubicacion/infrastructure/dto/location-api.dto'
import { toLocationStudentRequestDto } from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import { locationStudentResponseSchema } from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export class StudentUbicacionApiGateway implements StudentUbicacionGateway {
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
}

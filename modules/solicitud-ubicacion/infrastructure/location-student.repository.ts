import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { LocationStudentLookup } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { toLocationStudentLookup } from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import { locationStudentLookupResponseSchema } from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export class LocationStudentRepository {
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

export const locationStudentRepository = new LocationStudentRepository()


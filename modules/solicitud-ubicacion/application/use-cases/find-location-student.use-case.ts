import { AppError } from '@/modules/shared/application/errors/app-error'
import type { LocationStudentLookupPort } from '@/modules/solicitud-ubicacion/application/ports/location-read.ports'
import {
  isLocationDocumentNumber,
  normalizeLocationDocumentNumber,
  type LocationStudentLookup,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export class FindLocationStudentUseCase {
  constructor(private readonly studentLookup: LocationStudentLookupPort) {}

  async execute(documentNumber: string): Promise<LocationStudentLookup | null> {
    const normalizedDocument = normalizeLocationDocumentNumber(documentNumber)
    if (!isLocationDocumentNumber(normalizedDocument)) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El documento ingresado no es valido.',
      })
    }
    return await this.studentLookup.findByDocument(normalizedDocument)
  }
}

import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { ConstanciaStudentLookupPort } from '@/modules/solicitud-constancia/application/ports/constancia-read.ports'
import type { ConstanciaStudentGateway } from '@/modules/solicitud-constancia/application/ports/register-solicitud-constancia.ports'
import type {
  ConstanciaStudentLookup,
  SolicitudConstancia,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import type { ConstanciaStudentRequestDto } from '@/modules/solicitud-constancia/infrastructure/dto/constancia-request.dto'
import {
  toConstanciaStudentLookup,
  toConstanciaStudentRequestDto,
} from '@/modules/solicitud-constancia/infrastructure/mappers/constancia-api.mapper'
import {
  constanciaStudentLookupResponseSchema,
  constanciaStudentResponseSchema,
} from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

export class ConstanciaStudentApiGateway implements ConstanciaStudentGateway, ConstanciaStudentLookupPort {
  async save(solicitud: SolicitudConstancia): Promise<string> {
    try {
      const body = toConstanciaStudentRequestDto(solicitud)
      const response = solicitud.basicData.existingStudentId
        ? await resourceApiRepository.update<unknown, ConstanciaStudentRequestDto>(
            `estudiantes/${solicitud.basicData.existingStudentId}`,
            body,
          )
        : await resourceApiRepository.create<unknown, ConstanciaStudentRequestDto>('estudiantes', body)
      return parseExternalResponse(
        constanciaStudentResponseSchema,
        response,
        'No se pudo confirmar el identificador del estudiante.',
      ).id
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo guardar la informacion del estudiante.')
    }
  }

  async findByDocument(documentNumber: string): Promise<ConstanciaStudentLookup | null> {
    const response = await resourceApiRepository.getOptional<unknown>(`estudiantes/buscar/${documentNumber}`)
    if (response === null) return null
    const dto = parseExternalResponse(
      constanciaStudentLookupResponseSchema,
      response,
      'La API devolvio datos de estudiante incompletos.',
    )
    return toConstanciaStudentLookup(dto)
  }
}

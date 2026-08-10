import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import {
  ConstanciaStudentLookup,
  SolicitudConstancia,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { ConstanciaStudentRequestDto } from '@/modules/solicitud-constancia/infrastructure/dto/constancia-api.dto'
import {
  toConstanciaStudentLookup,
  toConstanciaStudentRequestDto,
} from '@/modules/solicitud-constancia/infrastructure/mappers/constancia-api.mapper'
import {
  constanciaStudentLookupResponseSchema,
  constanciaStudentResponseSchema,
} from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

export class ConstanciaStudentRepository {
  async findByDocument(documentNumber: string): Promise<ConstanciaStudentLookup> {
    const response = await resourceApiRepository.get<unknown>(`estudiantes/buscar/${documentNumber}`)
    const dto = parseExternalResponse(
      constanciaStudentLookupResponseSchema,
      response,
      'La API devolvio datos de estudiante no validos.',
    )
    return toConstanciaStudentLookup(dto)
  }

  async save(solicitud: SolicitudConstancia): Promise<string> {
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
      'No se pudo confirmar el registro del estudiante.',
    ).id
  }
}

export const constanciaStudentRepository = new ConstanciaStudentRepository()

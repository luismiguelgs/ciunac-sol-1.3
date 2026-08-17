import { AppError } from '@/modules/shared/application/errors/app-error'
import type { ConstanciaStudentLookupPort } from '@/modules/solicitud-constancia/application/ports/constancia-read.ports'
import {
  isConstanciaDocumentNumber,
  normalizeConstanciaDocumentNumber,
  type ConstanciaStudentLookup,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export class FindConstanciaStudentUseCase {
  constructor(private readonly studentLookup: ConstanciaStudentLookupPort) {}

  async execute(documentNumber: string): Promise<ConstanciaStudentLookup | null> {
    const normalizedDocument = normalizeConstanciaDocumentNumber(documentNumber)
    if (!isConstanciaDocumentNumber(normalizedDocument)) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El documento ingresado no es valido.',
      })
    }
    return await this.studentLookup.findByDocument(normalizedDocument)
  }
}

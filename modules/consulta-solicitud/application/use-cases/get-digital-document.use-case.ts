import { AppError } from '@/modules/shared/application/errors/app-error'
import type { DigitalDocument } from '@/modules/consulta-solicitud/domain/digital-document'
import type {
  DigitalDocumentPort,
  GetDigitalDocumentQuery,
} from '@/modules/consulta-solicitud/application/ports/digital-document.port'

export class GetDigitalDocumentUseCase {
  constructor(private readonly documents: DigitalDocumentPort) {}

  async execute(query: GetDigitalDocumentQuery): Promise<DigitalDocument | null> {
    if (!Number.isInteger(query.requestId) || query.requestId <= 0) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'La solicitud no es valida.',
      })
    }

    const document = await this.documents.findByRequest(query)
    if (!document) return null

    if (document.kind !== query.kind || document.requestId !== query.requestId) {
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: 'El servicio devolvio un documento digital inconsistente.',
      })
    }

    return document
  }
}

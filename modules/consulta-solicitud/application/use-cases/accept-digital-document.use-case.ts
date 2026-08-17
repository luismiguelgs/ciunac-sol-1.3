import { AppError } from '@/modules/shared/application/errors/app-error'
import type {
  AcceptDigitalDocumentCommand,
  DigitalDocumentPort,
} from '@/modules/consulta-solicitud/application/ports/digital-document.port'

export class AcceptDigitalDocumentUseCase {
  constructor(private readonly documents: DigitalDocumentPort) {}

  async execute(command: AcceptDigitalDocumentCommand): Promise<void> {
    if (!command.documentId.trim()) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El documento digital no es valido.',
      })
    }

    await this.documents.accept({
      ...command,
      documentId: command.documentId.trim(),
    })
  }
}

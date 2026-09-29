import { AppError } from '@/modules/shared/application/errors/app-error'
import type {
  AcceptDigitalDocumentCommand,
  DigitalDocument,
  GetDigitalDocumentQuery,
} from './model'

export async function getDigitalDocument(
  query: GetDigitalDocumentQuery,
  findByRequest: (query: GetDigitalDocumentQuery) => Promise<DigitalDocument | null>,
): Promise<DigitalDocument | null> {
  if (!Number.isInteger(query.requestId) || query.requestId <= 0) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La solicitud no es valida.',
    })
  }
  const document = await findByRequest(query)
  if (!document) return null
  if (document.kind !== query.kind || document.requestId !== query.requestId) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El servicio devolvio un documento digital inconsistente.',
    })
  }
  return document
}

export async function acceptDigitalDocument(
  command: AcceptDigitalDocumentCommand,
  accept: (command: AcceptDigitalDocumentCommand) => Promise<void>,
): Promise<void> {
  if (!command.documentId.trim()) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'El documento digital no es valido.',
    })
  }
  await accept({ ...command, documentId: command.documentId.trim() })
}

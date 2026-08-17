import type {
  AcceptDigitalDocumentCommand,
  DigitalDocumentPort,
  GetDigitalDocumentQuery,
} from '@/modules/consulta-solicitud/application/ports/digital-document.port'
import type { DigitalDocument } from '@/modules/consulta-solicitud/domain/digital-document'
import {
  toCertificateDigitalDocument,
  toConstanciaDigitalDocument,
} from '@/modules/consulta-solicitud/infrastructure/mappers/digital-document.mapper'
import {
  certificateDigitalDocumentResponseSchema,
  constanciaDigitalDocumentResponseSchema,
} from '@/modules/consulta-solicitud/infrastructure/validation/digital-document.schemas'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export class ApiDigitalDocumentGateway implements DigitalDocumentPort {
  async findByRequest(query: GetDigitalDocumentQuery): Promise<DigitalDocument | null> {
    const collection = collectionFor(query.kind)
    const response = await resourceApiRepository.getOptional<unknown>(
      `${collection}/solicitud/${query.requestId}`,
    )
    const item = query.kind === 'constancia' && Array.isArray(response) ? response[0] : response
    if (item === null || item === undefined) return null

    if (query.kind === 'constancia') {
      const dto = parseExternalResponse(
        constanciaDigitalDocumentResponseSchema,
        item,
        'La API devolvio una constancia digital no valida.',
      )
      return toConstanciaDigitalDocument(dto)
    }

    const dto = parseExternalResponse(
      certificateDigitalDocumentResponseSchema,
      item,
      'La API devolvio un certificado digital no valido.',
    )
    return toCertificateDigitalDocument(dto)
  }

  async accept(command: AcceptDigitalDocumentCommand): Promise<void> {
    await resourceApiRepository.updateCommand(
      `${collectionFor(command.kind)}/${command.documentId}`,
      {
        aceptado: true,
        fechaAceptacion: new Date().toISOString(),
      },
    )
  }
}

function collectionFor(kind: GetDigitalDocumentQuery['kind']): 'certificados' | 'constancias' {
  return kind === 'constancia' ? 'constancias' : 'certificados'
}

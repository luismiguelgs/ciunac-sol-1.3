import type {
  AcceptDigitalDocumentCommand,
  DigitalDocument,
  GetDigitalDocumentQuery,
} from '../model'
import {
  toCertificateDigitalDocument,
  toConstanciaDigitalDocument,
} from './digital-document.mapper'
import {
  certificateDigitalDocumentResponseSchema,
  constanciaDigitalDocumentResponseSchema,
} from './digital-document.schemas'
import { apiFetchOptional, apiCommand } from '@/lib/api.service'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export async function findDigitalDocument(query: GetDigitalDocumentQuery): Promise<DigitalDocument | null> {
  const collection = collectionFor(query.kind)
  const response = await apiFetchOptional<unknown>(`${collection}/solicitud/${query.requestId}`, 'GET')
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

export async function confirmDigitalDocumentAcceptance(command: AcceptDigitalDocumentCommand): Promise<void> {
  await apiCommand(`${collectionFor(command.kind)}/${command.documentId}`, 'PATCH', {
    aceptado: true,
    fechaAceptacion: new Date().toISOString(),
  })
}

function collectionFor(kind: GetDigitalDocumentQuery['kind']): 'certificados' | 'constancias' {
  return kind === 'constancia' ? 'constancias' : 'certificados'
}

import type {
  DigitalDocument as DomainDigitalDocument,
  DigitalDocumentKind as DomainDigitalDocumentKind,
} from '@/modules/consulta-solicitud/domain/digital-document'

export type DigitalDocumentResult = DomainDigitalDocument
export type DigitalDocumentKind = DomainDigitalDocumentKind

export type GetDigitalDocumentQuery = {
  kind: DigitalDocumentKind
  requestId: number
}

export type AcceptDigitalDocumentCommand = {
  kind: DigitalDocumentKind
  documentId: string
}

export interface DigitalDocumentPort {
  findByRequest(query: GetDigitalDocumentQuery): Promise<DigitalDocumentResult | null>
  accept(command: AcceptDigitalDocumentCommand): Promise<void>
}

export type DigitalDocumentKind = 'certificate' | 'constancia'

export type DigitalDocument = {
  kind: DigitalDocumentKind
  id: string
  requestId: number
  documentNumber: string
  descriptor: string
  level: string | null
  url: string
  accepted: boolean
  issuedAt: string | null
}

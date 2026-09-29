'use client'

import React from 'react'
import type { AcceptDigitalDocumentCommand, DigitalDocumentKind, GetDigitalDocumentQuery } from './model'
import { acceptDigitalDocument, getDigitalDocument } from './operations'
import { confirmDigitalDocumentAcceptance, findDigitalDocument } from './infrastructure/digital-document.client'
import DigitalDocumentDownloadView from './components/digital-document-download'

const getDocument = (query: GetDigitalDocumentQuery) => getDigitalDocument(query, findDigitalDocument)
const acceptDocument = (command: AcceptDigitalDocumentCommand) => acceptDigitalDocument(command, confirmDigitalDocumentAcceptance)

type Props = {
  solicitudId: number
  tipoDocumento: DigitalDocumentKind
  fallback: React.ReactNode
}

export function DigitalDocumentDownload(props: Props) {
  return <DigitalDocumentDownloadView {...props} getDocument={getDocument} acceptDocument={acceptDocument} />
}

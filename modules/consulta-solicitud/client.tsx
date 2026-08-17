'use client'

import React from 'react'
import type { DigitalDocumentKind } from '@/modules/consulta-solicitud/application/ports/digital-document.port'
import { AcceptDigitalDocumentUseCase } from '@/modules/consulta-solicitud/application/use-cases/accept-digital-document.use-case'
import { GetDigitalDocumentUseCase } from '@/modules/consulta-solicitud/application/use-cases/get-digital-document.use-case'
import { ApiDigitalDocumentGateway } from '@/modules/consulta-solicitud/infrastructure/api/digital-document.gateway'
import DigitalDocumentDownloadView from '@/modules/consulta-solicitud/presentation/components/digital-document-download'

const gateway = new ApiDigitalDocumentGateway()
const getDigitalDocument = new GetDigitalDocumentUseCase(gateway)
const acceptDigitalDocument = new AcceptDigitalDocumentUseCase(gateway)

type Props = {
  solicitudId: number
  tipoDocumento: DigitalDocumentKind
  fallback: React.ReactNode
}

export function DigitalDocumentDownload(props: Props) {
  return (
    <DigitalDocumentDownloadView
      {...props}
      getDocument={(query) => getDigitalDocument.execute(query)}
      acceptDocument={(command) => acceptDigitalDocument.execute(command)}
    />
  )
}

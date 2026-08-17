'use client'

import React from 'react'
import Image from 'next/image'
import { pdf } from '@react-pdf/renderer'
import { FileDown } from 'lucide-react'
import pdfImage from '@/assets/pdf.png'
import { Button } from '@/components/ui/button'
import LocationCertificatePdf from '@/modules/consulta-ubicacion/presentation/components/location-certificate-pdf'
import type { LocationCertificateDocument } from '@/modules/consulta-ubicacion/presentation/location-consultation.presenter'

type Props = {
  document: LocationCertificateDocument
  fileName: string
}

type DownloadState = 'idle' | 'generating' | 'error'

export default function LocationCertificateDownload({ document, fileName }: Props) {
  const [state, setState] = React.useState<DownloadState>('idle')

  const download = async () => {
    if (state === 'generating') return
    setState('generating')

    try {
      const blob = await pdf(<LocationCertificatePdf document={document} />).toBlob()
      downloadBlob(blob, fileName)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Image src={pdfImage} alt="Documento PDF" width={36} height={36} />
        <Button type="button" className="flex-1" disabled={state === 'generating'} onClick={download}>
          <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
          {state === 'generating' ? 'Generando constancia...' : `Descargar Constancia ${document.examDate}`}
        </Button>
      </div>
      {state === 'error' ? (
        <p className="pl-2 text-sm text-destructive" role="alert">
          No se pudo generar la constancia. Intente nuevamente.
        </p>
      ) : (
        <p className="pl-2 text-sm text-muted-foreground">Descargue su constancia en formato PDF.</p>
      )}
    </div>
  )
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

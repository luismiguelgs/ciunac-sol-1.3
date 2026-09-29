'use client'

import React from 'react'
import Image from 'next/image'
import { AlertCircle, CloudDownloadIcon } from 'lucide-react'
import pdfImage from '@/assets/pdf.png'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { AdministrativeCargoDocument } from '@/modules/shared/components/administrative-cargo-pdf'

export default function LocationCargoDownload({
  document,
  fileName,
}: {
  document: AdministrativeCargoDocument
  fileName: string
}) {
  const [status, setStatus] = React.useState<'idle' | 'generating' | 'error'>('idle')

  const download = async () => {
    if (status === 'generating') return
    setStatus('generating')

    try {
      const [{ pdf }, { default: AdministrativeCargoPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/modules/shared/components/administrative-cargo-pdf'),
      ])
      const blob = await pdf(<AdministrativeCargoPdf document={document} />).toBlob()
      downloadBlob(blob, fileName)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {status === 'error' ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo generar el PDF</AlertTitle>
          <AlertDescription>No se pudo generar el cargo. Intente nuevamente.</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-center gap-10">
        <Image src={pdfImage} alt="Documento PDF" width={50} height={50} />
        <Button type="button" onClick={download} disabled={status === 'generating'}>
          {status === 'generating' ? 'Generando cargo...' : 'Descargar Cargo'}
          <CloudDownloadIcon className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

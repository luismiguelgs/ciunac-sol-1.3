'use client'

import React from 'react'
import Image from 'next/image'
import { pdf } from '@react-pdf/renderer'
import { FileDown } from 'lucide-react'
import pdfImage from '@/assets/pdf.png'
import { Button } from '@/components/ui/button'
import ConstanciaFormat from '@/modules/consulta-ubicacion/components/ConstanciaFormat'
import { LocationExamResult } from '@/modules/consulta-ubicacion/domain/location-consultation'

type Props = {
  item: LocationExamResult
  fecha: string
  ciclo: string
  yearName: string
}

type DownloadState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'error'; message: string }

export default function Download({ item, fecha, ciclo, yearName }: Props) {
  const [state, setState] = React.useState<DownloadState>({ status: 'idle' })

  const descargarPDF = async () => {
    if (state.status === 'generating') return
    setState({ status: 'generating' })

    try {
      const document = <ConstanciaFormat data={item} fecha={fecha} ciclo={ciclo} yearName={yearName} />
      const blob = await pdf(document).toBlob()
      const blobUrl = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      anchor.style.display = 'none'
      anchor.href = blobUrl
      anchor.download = fileName(item)
      window.document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(blobUrl)
      setState({ status: 'idle' })
    } catch {
      setState({
        status: 'error',
        message: 'No se pudo generar la constancia. Intente nuevamente.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Image src={pdfImage} alt="Documento PDF" width={36} height={36} />
        <Button
          type="button"
          variant="default"
          className="flex-1"
          disabled={state.status === 'generating'}
          onClick={descargarPDF}
        >
          <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
          {state.status === 'generating' ? 'Generando constancia...' : `Descargar Constancia ${fecha}`}
        </Button>
      </div>
      {state.status === 'error' ? (
        <p className="pl-2 text-sm text-destructive" role="alert">{state.message}</p>
      ) : (
        <p className="pl-2 text-sm text-muted-foreground">Descargue su constancia en formato PDF.</p>
      )}
    </div>
  )
}

function fileName(item: LocationExamResult): string {
  const parts = [
    item.student.documentNumber,
    item.language.name,
    item.evaluatedLevel.name,
  ].map((value) => value.replace(/[^A-Za-z0-9_-]+/g, '-'))
  return `${parts.join('-')}.pdf`
}

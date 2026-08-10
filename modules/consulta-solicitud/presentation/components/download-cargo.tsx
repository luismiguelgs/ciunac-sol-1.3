'use client'

import React from 'react'
import Image from 'next/image'
import { pdf } from '@react-pdf/renderer'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import pdfImage from '@/assets/pdf.png'
import CertificateCargoPdf from '@/modules/solicitud-certificado/presentation/components/cargo-pdf'
import { CertificateCargo } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { ConsultedRequest } from '@/modules/consultas/domain/consulted-request'
import { ConsultationText } from '@/modules/consultas/domain/consultation-text'

type Props = {
  request: ConsultedRequest
  texts: ConsultationText[]
}

type PdfState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'error'; message: string }

export default function DownloadCargo({ request, texts }: Props) {
  const [state, setState] = React.useState<PdfState>({ status: 'idle' })
  const fileName = `${request.student.documentNumber}-${request.language.name}-${request.level.name}.pdf`

  const downloadPdf = async () => {
    if (state.status === 'generating') return
    setState({ status: 'generating' })
    try {
      const data: CertificateCargo = {
        id: request.id,
        typeName: request.requestType.name,
        createdAt: formatDate(request.createdAt),
        student: {
          names: request.student.names,
          lastNames: request.student.lastNames,
          documentNumber: request.student.documentNumber,
        },
        languageName: request.language.name,
        levelName: request.level.name,
        amount: request.payment.amount,
        voucherNumber: request.payment.voucherNumber,
        paidAt: request.payment.paidAt ? formatDate(request.payment.paidAt) : null,
      }
      const blob = await pdf(<CertificateCargoPdf texts={texts} solicitud={data} />).toBlob()
      downloadBlob(blob, fileName)
      setState({ status: 'idle' })
    } catch {
      setState({ status: 'error', message: 'No se pudo generar el cargo PDF. Intente nuevamente.' })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {state.status === 'error' ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo generar el cargo</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-center gap-1">
        <Image src={pdfImage} alt="Cargo PDF" width={50} height={50} />
        <Button variant="ghost" className="text-base" onClick={downloadPdf} disabled={state.status === 'generating'}>
          {state.status === 'generating' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {state.status === 'generating' ? 'Generando cargo...' : fileName}
        </Button>
      </div>
      <p className="pl-2 text-sm font-medium text-destructive">Puede descargar su cargo aqui.</p>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE')
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

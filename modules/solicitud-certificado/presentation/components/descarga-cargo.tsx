'use client'

import React from 'react'
import Image from 'next/image'
import { AlertCircle, CloudDownloadIcon, Loader2 } from 'lucide-react'
import pdfImage from '@/assets/pdf.png'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { getCertificateCargo } from '@/modules/solicitud-certificado/client'
import { CertificateCargo, CertificateText } from '@/modules/solicitud-certificado/domain/solicitud-certificado'

const REQUIRED_TEXTS = ['TEXTO_NOMBREAN', 'TEXTO_1_FINAL', 'TEXTO_1_DISCLAMER', 'TEXTO_2_DISCLAMER']

type CargoLoadState =
  | { status: 'loading' }
  | { status: 'data'; data: CertificateCargo }
  | { status: 'empty' }
  | { status: 'error'; error: AppError }

export default function DescargaCargo({ solicitudId, texts }: { solicitudId: number; texts: CertificateText[] }) {
  const [state, setState] = React.useState<CargoLoadState>({ status: 'loading' })
  const [pdfError, setPdfError] = React.useState<string | null>(null)
  const [generating, setGenerating] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setState({ status: 'loading' })
      setPdfError(null)
      try {
        const result = await getCertificateCargo(solicitudId)
        if (!mounted) return
        setState(result ? { status: 'data', data: result } : { status: 'empty' })
      } catch (cause) {
        if (mounted) setState({ status: 'error', error: normalizeAppError(cause, 'No se pudo cargar el cargo') })
      }
    }
    void load()
    return () => { mounted = false }
  }, [attempt, solicitudId])

  const exportPdf = async () => {
    if (state.status !== 'data' || generating) return
    if (!hasRequiredTexts(texts)) {
      setPdfError('Los textos institucionales necesarios para generar el cargo no estan disponibles.')
      return
    }
    try {
      setPdfError(null)
      setGenerating(true)
      const [{ pdf }, { default: CertificateCargoPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/modules/solicitud-certificado/presentation/components/cargo-pdf'),
      ])
      const blob = await pdf(<CertificateCargoPdf texts={texts} solicitud={state.data} />).toBlob()
      downloadBlob(blob, `CERTIFICADO-${state.data.student.documentNumber}-${state.data.id}.pdf`)
    } catch (cause) {
      setPdfError(normalizeAppError(cause, 'No se pudo generar el cargo PDF').message)
    } finally {
      setGenerating(false)
    }
  }

  if (state.status === 'loading') {
    return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando cargo...</Button>
  }
  if (state.status === 'empty') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cargo aun no disponible</AlertTitle>
        <AlertDescription>No se encontraron datos para generar el cargo de esta solicitud.</AlertDescription>
      </Alert>
    )
  }
  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el cargo</AlertTitle>
          <AlertDescription>{state.error.message}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>Reintentar carga</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {pdfError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo generar el PDF</AlertTitle>
          <AlertDescription>{pdfError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-center gap-10">
        <Image src={pdfImage.src} alt="Documento PDF" width={50} height={50} />
        <Button onClick={exportPdf} disabled={!hasRequiredTexts(texts) || generating}>
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {generating ? 'Generando cargo...' : 'Descargar Cargo'}
          {!generating ? <CloudDownloadIcon className="ml-2" /> : null}
        </Button>
      </div>
      {!hasRequiredTexts(texts) ? <p className="text-sm text-destructive">Los textos del cargo no estan disponibles.</p> : null}
    </div>
  )
}

function hasRequiredTexts(texts: CertificateText[]): boolean {
  return REQUIRED_TEXTS.every((code) => texts.some((item) => item.code === code && item.content.trim()))
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

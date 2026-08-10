'use client'

import React from 'react'
import Image from 'next/image'
import { pdf } from '@react-pdf/renderer'
import { AlertCircle, CloudDownloadIcon, Loader2 } from 'lucide-react'
import pdfImage from '@/assets/pdf.png'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { ITexto } from '@/modules/shared/interfaces/types.interface'
import { ConstanciaCargo } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { constanciaCargoRepository } from '@/modules/solicitud-constancia/infrastructure/constancia-cargo.repository'
import ConstanciaCargoPdf from '@/modules/solicitud-constancia/presentation/components/cargo-pdf'
import { useTextsStore } from '@/stores/types.stores'

type CargoLoadState =
  | { status: 'loading' }
  | { status: 'data'; data: ConstanciaCargo }
  | { status: 'empty' }
  | { status: 'error'; error: AppError }

export default function DescargaCargo({ solicitudId }: { solicitudId: number | null }) {
  const { data: textos } = useCatalogStore(useTextsStore)
  const [state, setState] = React.useState<CargoLoadState>({ status: 'loading' })
  const [pdfError, setPdfError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    if (!solicitudId || solicitudId <= 0) {
      setState({
        status: 'error',
        error: new AppError({ code: 'VALIDATION', message: 'El identificador de la solicitud no es valido.' }),
      })
      return
    }

    const load = async () => {
      setState({ status: 'loading' })
      setPdfError(null)
      try {
        const result = await constanciaCargoRepository.findById(solicitudId)
        if (!mounted) return
        setState(result ? { status: 'data', data: result } : { status: 'empty' })
      } catch (cause) {
        if (mounted) {
          setState({ status: 'error', error: normalizeAppError(cause, 'No se pudo cargar el cargo') })
        }
      }
    }

    void load()
    return () => { mounted = false }
  }, [attempt, solicitudId])

  const exportPdf = async () => {
    if (state.status !== 'data') return

    try {
      setPdfError(null)
      const blob = await pdf(
        <ConstanciaCargoPdf textos={(textos ?? []) as ITexto[]} solicitud={state.data} />,
      ).toBlob()
      downloadBlob(blob, `CONSTANCIA-${state.data.student.documentNumber}-${state.data.id}.pdf`)
    } catch (cause) {
      setPdfError(normalizeAppError(cause, 'No se pudo generar el cargo PDF').message)
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
        {solicitudId ? (
          <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            Reintentar carga
          </Button>
        ) : null}
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
        <Button onClick={exportPdf}>
          Descargar cargo <CloudDownloadIcon className="ml-2" />
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

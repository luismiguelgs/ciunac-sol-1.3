'use client'

import React from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { pdf } from '@react-pdf/renderer'
import { AlertCircle, CloudDownloadIcon, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import CargoPdf from '@/modules/solicitud-certificado/components/cargo-pdf'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface'
import { ITexto } from '@/modules/shared/interfaces/types.interface'
import SolicitudesService from '@/services/solicitudes.service'
import { useTextsStore } from '@/stores/types.stores'
import pdfImage from '@/assets/pdf.png'

function Finish() {
  const searchParams = useSearchParams()
  const id = Number(searchParams.get('id'))
  const { data: textos } = useCatalogStore(useTextsStore)
  const [data, setData] = React.useState<ISolicitudRes | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    if (!Number.isFinite(id) || id <= 0) {
      setLoading(false)
      setError('El identificador de la solicitud no es valido.')
      return
    }

    const getData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await SolicitudesService.getItemId(id)
        if (mounted) setData(result)
      } catch (cause) {
        if (mounted) setError(normalizeAppError(cause, 'No se pudo cargar el cargo').message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void getData()
    return () => { mounted = false }
  }, [attempt, id])

  const exportPDF = async () => {
    if (!hasCargoData(data)) {
      setError('La solicitud no tiene todos los datos necesarios para generar el cargo.')
      return
    }

    try {
      setError(null)
      const blobPdf = await pdf(<CargoPdf textos={(textos ?? []) as ITexto[]} obj={data} />).toBlob()
      downloadBlob(blobPdf, `${data.estudiante.numeroDocumento}-${data.idioma.nombre}-${data.nivel.nombre}.pdf`)
    } catch (cause) {
      setError(normalizeAppError(cause, 'No se pudo generar el cargo PDF').message)
    }
  }

  if (loading) {
    return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando cargo...</Button>
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cargo no disponible</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-center gap-10">
        <Image src={pdfImage.src} alt="PDF" width={50} height={50} className="cursor-pointer" onClick={exportPDF} />
        <Button onClick={exportPDF} disabled={!hasCargoData(data)}>
          Descargar Cargo <CloudDownloadIcon className="ml-2" />
        </Button>
      </div>
      {error && Number.isFinite(id) && id > 0 ? (
        <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>Reintentar carga</Button>
      ) : null}
    </div>
  )
}

function hasCargoData(data: ISolicitudRes | null): data is ISolicitudRes & {
  estudiante: NonNullable<ISolicitudRes['estudiante']>
  idioma: NonNullable<ISolicitudRes['idioma']>
  nivel: NonNullable<ISolicitudRes['nivel']>
} {
  return Boolean(data?.id && data.estudiante?.numeroDocumento && data.idioma?.nombre && data.nivel?.nombre)
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function DescargaCargo() {
  return <React.Suspense fallback={<div>Cargando cargo...</div>}><Finish /></React.Suspense>
}

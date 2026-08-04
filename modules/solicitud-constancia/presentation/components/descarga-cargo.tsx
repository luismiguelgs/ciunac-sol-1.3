'use client'

import React from 'react'
import Image from 'next/image'
import { pdf } from '@react-pdf/renderer'
import { AlertCircle, CloudDownloadIcon, Loader2 } from 'lucide-react'
import pdfImage from '@/assets/pdf.png'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface'
import { ITexto } from '@/modules/shared/interfaces/types.interface'
import ConstanciaCargoPdf from '@/modules/solicitud-constancia/presentation/components/cargo-pdf'
import SolicitudesService from '@/services/solicitudes.service'
import { useTextsStore } from '@/stores/types.stores'

export default function DescargaCargo({ solicitudId }: { solicitudId: number | null }) {
  const { data: textos } = useCatalogStore(useTextsStore)
  const [data, setData] = React.useState<ISolicitudRes | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    if (!solicitudId || solicitudId <= 0) {
      setLoading(false)
      setError('El identificador de la solicitud no es valido.')
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await SolicitudesService.getItemId(solicitudId)
        if (mounted) setData(result)
      } catch (cause) {
        if (mounted) setError(normalizeAppError(cause, 'No se pudo cargar el cargo').message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    return () => { mounted = false }
  }, [attempt, solicitudId])

  const exportPdf = async () => {
    if (!hasCargoData(data)) {
      setError('La solicitud no tiene todos los datos necesarios para generar el cargo.')
      return
    }

    try {
      setError(null)
      const blob = await pdf(
        <ConstanciaCargoPdf textos={(textos ?? []) as ITexto[]} solicitud={data} />,
      ).toBlob()
      downloadBlob(blob, `CONSTANCIA-${data.estudiante.numeroDocumento}-${data.id}.pdf`)
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
        <Image src={pdfImage.src} alt="Documento PDF" width={50} height={50} />
        <Button onClick={exportPdf} disabled={!hasCargoData(data)}>
          Descargar cargo <CloudDownloadIcon className="ml-2" />
        </Button>
      </div>
      {error && solicitudId ? (
        <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
          Reintentar carga
        </Button>
      ) : null}
    </div>
  )
}

function hasCargoData(data: ISolicitudRes | null): data is ISolicitudRes & {
  id: number
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

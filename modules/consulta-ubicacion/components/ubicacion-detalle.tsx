'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import DescargaCargo from '@/modules/solicitud-ubicacion/components/descarga-cargo'
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import useCiclos from '@/modules/consulta-ubicacion/hooks/useCiclos'
import { IDetalleExamenUbicacion, IExamenUbicacion } from '@/modules/consulta-ubicacion/interfaces/examen.interface'
import SolicitudesExamenService from '@/modules/consulta-ubicacion/services/solicitud-examen.service'
import Download from './download'

type Props = {
  dni: string
  solicitudId?: number
}

export default function UbicacionDetalle({ dni, solicitudId }: Props) {
  const { data: ciclos, loading: ciclosLoading, error: ciclosError, retry: retryCiclos } = useCiclos()
  const [notas, setNotas] = React.useState<IDetalleExamenUbicacion[]>([])
  const [examenes, setExamenes] = React.useState<IExamenUbicacion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<AppError | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [resultNotas, resultExamenes] = await Promise.all([
          SolicitudesExamenService.fetchItemsDetail(dni),
          SolicitudesExamenService.fetchItems(),
        ])
        if (mounted) {
          setNotas(resultNotas)
          setExamenes(resultExamenes)
        }
      } catch (cause) {
        if (mounted) setError(normalizeAppError(cause, 'No se pudieron cargar las notas'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchData()
    return () => { mounted = false }
  }, [attempt, dni])

  const retry = () => {
    setAttempt((value) => value + 1)
    if (ciclosError) retryCiclos()
  }

  if (loading || ciclosLoading) return <Loading />

  if (error || ciclosError) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="font-medium">No se pudieron cargar las notas del examen.</p>
        <Button type="button" onClick={retry}>Reintentar</Button>
      </div>
    )
  }

  if (notas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="space-y-2">
          <p className="font-medium">Aun no se encontraron notas para este alumno.</p>
          <p className="text-sm text-muted-foreground">Mientras se registran las notas, puede descargar el cargo de su solicitud.</p>
        </div>
        {solicitudId ? <DescargaCargo solicitudId={solicitudId} /> : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notas.map((nota) => {
        const examen = examenes.find((item) => item.id === nota.examenId)
        const ciclo = ciclos.find((item) => item.id === nota.calificacion?.cicloId)?.nombre ?? 'No disponible'
        const fecha = fechaFormateada(examen?.fecha)
        return (
          <React.Fragment key={nota.id}>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium">{nota.idioma?.nombre ?? 'Idioma no disponible'}</h3>
                <p className="text-sm text-muted-foreground">Fecha: {fecha || 'No disponible'}</p>
              </div>
              <p className="text-sm">Nota: <span className="font-bold">{nota.nota ?? 'No disponible'}/100</span></p>
              <p className="text-sm">Ubicacion: <span className="font-bold">{ciclo}</span></p>
              <Download item={nota} fecha={fecha} ciclo={ciclo} />
            </div>
            <Separator />
          </React.Fragment>
        )
      })}
    </div>
  )
}

function fechaFormateada(fecha: string | number | Date | undefined) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE')
}

function Loading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Separator />
        </React.Fragment>
      ))}
    </div>
  )
}

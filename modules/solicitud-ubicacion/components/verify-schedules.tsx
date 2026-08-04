'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import MyAlert from '@/components/forms/myAlert'
import MyTable from '@/components/forms/my-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import FormEmailSolicitud from '@/modules/solicitud-ubicacion/components/form-email-solicitud'
import IcronogramaExam from '@/modules/solicitud-ubicacion/interfaces/cronograma-exam.interface'
import CronogramaExamService from '@/modules/solicitud-ubicacion/services/cronogramaExam.service'

export default function VerifySchedules() {
  const [cronogramas, setCronogramas] = React.useState<IcronogramaExam[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    const fetchCronogramas = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await CronogramaExamService.getAll()
        if (mounted) setCronogramas(data)
      } catch (cause) {
        if (mounted) setError(normalizeAppError(cause, 'No se pudieron cargar los cronogramas').message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchCronogramas()
    return () => { mounted = false }
  }, [attempt])

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium">{error}</p>
        <Button type="button" onClick={() => setAttempt((value) => value + 1)}>Reintentar</Button>
      </div>
    )
  }

  if (cronogramas.some((schedule) => schedule.activo === true)) return <FormEmailSolicitud />

  const upcoming = schedulesLeft(cronogramas)
  return (
    <div className="mb-2 mt-2">
      <MyAlert
        title="Cronogramas"
        description={<>En estos momentos no hay cronogramas activos para el examen de ubicacion. Para consultas comuniquese al telefono <strong>014291931</strong>.</>}
        type="info"
      />
      <div className="p-2" />
      {upcoming.length > 0 ? (
        <MyTable
          data={upcoming}
          columns={[
            { header: 'Modulo', accessor: 'modulo', render: (_value, row) => row.modulo?.nombre ?? 'No disponible' },
            { header: 'Fecha', accessor: 'fecha', render: (value) => formatDate(value as string) },
          ]}
        />
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">No hay proximas fechas publicadas.</p>
      )}
    </div>
  )
}

function schedulesLeft(cronogramas: IcronogramaExam[]) {
  const limit = new Date()
  limit.setHours(0, 0, 0, 0)
  limit.setDate(limit.getDate() + 2)

  return cronogramas
    .filter((item) => {
      const date = new Date(item.fecha)
      return !Number.isNaN(date.getTime()) && date > limit
    })
    .sort((a, b) => Number(a.modulo?.nombre ?? 0) - Number(b.modulo?.nombre ?? 0))
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString('es-PE')
}

function Loading() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-[150px] w-full" />
      <Skeleton className="h-[150px] w-full" />
    </div>
  )
}

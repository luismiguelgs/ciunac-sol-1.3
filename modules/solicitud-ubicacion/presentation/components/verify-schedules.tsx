import MyAlert from '@/components/forms/myAlert'
import MyTable from '@/components/forms/my-table'
import { LocationSchedule, LocationText } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import FormEmailSolicitud from '@/modules/solicitud-ubicacion/presentation/components/form-email-solicitud'

export default function VerifySchedules({ schedules, texts }: { schedules: LocationSchedule[]; texts: LocationText[] }) {
  if (schedules.some((schedule) => schedule.active)) return <FormEmailSolicitud texts={texts} />
  const upcoming = schedulesLeft(schedules)
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
            { header: 'Modulo', accessor: 'moduleName' },
            { header: 'Fecha', accessor: 'scheduledAt', render: (value) => formatDate(value as string) },
          ]}
        />
      ) : <p className="py-4 text-center text-sm text-muted-foreground">No hay proximas fechas publicadas.</p>}
    </div>
  )
}

function schedulesLeft(schedules: LocationSchedule[]): LocationSchedule[] {
  const limit = new Date()
  limit.setHours(0, 0, 0, 0)
  limit.setDate(limit.getDate() + 2)
  return schedules
    .filter((item) => new Date(item.scheduledAt) > limit)
    .sort((left, right) => Number(left.moduleName) - Number(right.moduleName))
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-PE')
}

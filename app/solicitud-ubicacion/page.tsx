import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import RequestTypesPriceTable from '@/modules/shared/components/request-types-price-table'
import { getLocationEntryData } from '@/modules/solicitud-ubicacion/infrastructure/server/location-catalog.repository'
import VerifySchedules from '@/modules/solicitud-ubicacion/presentation/components/verify-schedules'

export const dynamic = 'force-dynamic'

export default async function SolicitudUbicacionPage() {
  const { catalogs, schedules } = await getLocationEntryData()
  const priceRows = [{
    id: catalogs.requestType.id,
    solicitud: catalogs.requestType.name,
    precio: catalogs.requestType.price,
  }]
  return (
    <div className="p-4">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">Verificacion de correo electronico</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <VerificacionEmail
          priceTable={<RequestTypesPriceTable data={priceRows} emptyLabel="Examen de ubicacion no disponible." />}
        />
        <VerifySchedules schedules={schedules} texts={catalogs.texts} />
      </div>
    </div>
  )
}


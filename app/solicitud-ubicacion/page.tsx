import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import RequestTypesPriceTable from '@/modules/shared/components/request-types-price-table'
import { LocationScheduleVerification } from '@/modules/solicitud-ubicacion'
import { getLocationEntryData } from '@/modules/solicitud-ubicacion/server'

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
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">Verificación de correo electrónico</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <VerificacionEmail
          priceTable={<RequestTypesPriceTable data={priceRows} emptyLabel="Examen de ubicacion no disponible." />}
        />
        <LocationScheduleVerification schedules={schedules} texts={catalogs.texts} />
      </div>
    </div>
  )
}

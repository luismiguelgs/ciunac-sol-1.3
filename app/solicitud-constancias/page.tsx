import FormEmailSolicitud from '@/modules/shared/components/form-email-solicitud'
import RequestTypesPriceTable from '@/modules/shared/components/request-types-price-table'
import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import { getConstanciaTypes } from '@/modules/solicitud-constancia/server'

export const dynamic = 'force-dynamic'

export default async function SolicitudConstanciasPage() {
  const constancias = await getConstanciaTypes()
  const priceRows = constancias.map((item) => ({ id: item.id, solicitud: item.name, precio: item.price }))

  return (
    <div className="p-4">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">
        Verificacion de correo electronico
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <VerificacionEmail
          priceTable={(
            <RequestTypesPriceTable data={priceRows} emptyLabel="No hay constancias disponibles." />
          )}
        />
        <div>
          <FormEmailSolicitud path="solicitud-constancias" purpose="CONSTANCIA" />
        </div>
      </div>
    </div>
  )
}

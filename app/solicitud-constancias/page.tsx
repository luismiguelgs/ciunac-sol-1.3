import FormEmailSolicitud from '@/modules/shared/components/form-email-solicitud'
import RequestTypesPriceTable from '@/modules/shared/components/request-types-price-table'
import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { isConstanciaType } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { constanciaTypeCatalogResponseSchema } from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

export const dynamic = 'force-dynamic'

async function getConstancias(): Promise<ITipoSolicitud[]> {
  const response = await ciunacRequest<unknown>('tipossolicitud')
  if (response === null) return []

  const requestTypes = parseExternalResponse(
    constanciaTypeCatalogResponseSchema,
    response,
    'La API devolvio tipos de solicitud no validos',
  )

  return requestTypes.filter((item) => isConstanciaType(item.id))
}

export default async function SolicitudConstanciasPage() {
  const constancias = await getConstancias()

  return (
    <div className="p-4">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">
        Verificacion de correo electronico
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <VerificacionEmail
          priceTable={(
            <RequestTypesPriceTable data={constancias} emptyLabel="No hay constancias disponibles." />
          )}
        />
        <div>
          <FormEmailSolicitud path="solicitud-constancias" purpose="CONSTANCIA" />
        </div>
      </div>
    </div>
  )
}

import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import FormEmailSolicitud from '@/modules/shared/components/form-email-solicitud'
import RequestTypesPriceTable from '@/modules/shared/components/request-types-price-table'
import { getCertificateTypes } from '@/modules/solicitud-certificado/server'

export const dynamic = 'force-dynamic'

export default async function SolicitudCertificadoPage() {
  const certificates = await getCertificateTypes()
  const priceRows = certificates.map((item) => ({ id: item.id, solicitud: item.name, precio: item.price }))

  return (
    <div className="p-4">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">Verificación de correo electrónico</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <VerificacionEmail
          priceTable={<RequestTypesPriceTable data={priceRows} emptyLabel="No hay certificados disponibles." />}
        />
        <FormEmailSolicitud path="solicitud-certificados" purpose="CERTIFICADO" />
      </div>
    </div>
  )
}

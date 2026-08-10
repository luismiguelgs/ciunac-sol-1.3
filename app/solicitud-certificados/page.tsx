import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import FormEmailSolicitud from '@/modules/shared/components/form-email-solicitud'
import CertificadosTable from '@/modules/consulta-certificado/components/certificados-table'
import { getCertificateTypes } from '@/modules/solicitud-certificado/infrastructure/server/certificate-catalog.repository'

export const dynamic = 'force-dynamic'

export default async function SolicitudCertificadoPage() {
  const certificates = await getCertificateTypes()
  const priceRows = certificates.map((item) => ({ id: item.id, solicitud: item.name, precio: item.price }))

  return (
    <div className="p-4">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">Verificacion de correo electronico</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <VerificacionEmail priceTable={<CertificadosTable data={priceRows} />} />
        <FormEmailSolicitud path="solicitud-certificados" purpose="CERTIFICADO" />
      </div>
    </div>
  )
}

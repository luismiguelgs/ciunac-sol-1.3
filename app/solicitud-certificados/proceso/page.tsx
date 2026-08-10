import { redirect } from 'next/navigation'
import { readVerifiedSession } from '@/modules/security/server/session'
import { getCertificateCatalogs } from '@/modules/solicitud-certificado/infrastructure/server/certificate-catalog.repository'
import SolicitudCertificadoProcess from '@/modules/solicitud-certificado/presentation/components/solicitud-certificado-process'

export default async function SolicitudCertificadosPage() {
  const session = await readVerifiedSession('CERTIFICADO')
  if (!session) redirect('/solicitud-certificados')
  const catalogs = await getCertificateCatalogs()
  return <SolicitudCertificadoProcess email={session.email} catalogs={catalogs} />
}

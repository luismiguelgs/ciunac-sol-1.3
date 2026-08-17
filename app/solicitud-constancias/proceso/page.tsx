import { redirect } from 'next/navigation'
import { readVerifiedSession } from '@/modules/security/server/session'
import { SolicitudConstanciaProcess } from '@/modules/solicitud-constancia'
import { getConstanciaCatalogs } from '@/modules/solicitud-constancia/server'

export default async function SolicitudConstanciasProcesoPage() {
  const session = await readVerifiedSession('CONSTANCIA')
  if (!session) redirect('/solicitud-constancias')

  const catalogs = await getConstanciaCatalogs()
  return <SolicitudConstanciaProcess email={session.email} catalogs={catalogs} />
}

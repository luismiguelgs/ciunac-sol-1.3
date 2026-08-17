import { redirect } from 'next/navigation'
import { readVerifiedSession } from '@/modules/security/server/session'
import { SolicitudUbicacionProcess } from '@/modules/solicitud-ubicacion'
import {
  getLocationCatalogs,
  readLocationProfile,
} from '@/modules/solicitud-ubicacion/server'

export default async function ProcesoUbicacionPage() {
  const [session, profile] = await Promise.all([
    readVerifiedSession('UBICACION'),
    readLocationProfile(),
  ])
  if (!session || !profile) redirect('/solicitud-ubicacion')
  const catalogs = await getLocationCatalogs()
  return (
    <SolicitudUbicacionProcess
      email={session.email}
      isCiunacStudent={profile.isCiunacStudent}
      catalogs={catalogs}
    />
  )
}

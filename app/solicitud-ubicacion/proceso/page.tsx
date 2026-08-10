import { redirect } from 'next/navigation'
import { readVerifiedSession } from '@/modules/security/server/session'
import { getLocationCatalogs } from '@/modules/solicitud-ubicacion/infrastructure/server/location-catalog.repository'
import { readLocationProfile } from '@/modules/solicitud-ubicacion/infrastructure/server/location-profile-session'
import SolicitudUbicacionProcess from '@/modules/solicitud-ubicacion/presentation/components/solicitud-ubicacion-process'

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

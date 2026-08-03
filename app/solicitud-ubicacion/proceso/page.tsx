import { redirect } from 'next/navigation'
import SolicitudUbicacionProcess from '@/modules/solicitud-ubicacion/presentation/components/solicitud-ubicacion-process'
import { readVerifiedSession } from '@/modules/security/server/session'

type PageProps = {
    searchParams: Promise<{ alumno_ciunac?: string }>
}

export default async function ProcesoUbicacionPage({ searchParams }: PageProps) {
    const session = await readVerifiedSession('UBICACION')
    if (!session) redirect('/solicitud-ubicacion')

    const params = await searchParams
    return <SolicitudUbicacionProcess email={session.email} alumno={params.alumno_ciunac === 'true'} />
}

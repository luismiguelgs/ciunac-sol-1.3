import { redirect } from 'next/navigation'
import { SolicitudBecaProcess } from '@/modules/solicitud-beca'
import { getScholarshipCatalogs } from '@/modules/solicitud-beca/server'
import { readVerifiedSession } from '@/modules/security/server/session'

export default async function BecaProcessPage() {
    const session = await readVerifiedSession('BECA')
    if (!session) redirect('/solicitud-beca')
    const catalogs = await getScholarshipCatalogs()

    return <SolicitudBecaProcess email={session.email} catalogs={catalogs} />
}

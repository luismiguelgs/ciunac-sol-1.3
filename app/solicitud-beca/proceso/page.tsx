import { redirect } from 'next/navigation'
import SolicitudBecaProcess from '@/modules/solicitud-beca/presentation/components/solicitud-beca-process'
import { readVerifiedSession } from '@/modules/security/server/session'
import { getScholarshipCatalogs } from '@/modules/solicitud-beca/infrastructure/server/scholarship-catalog.repository'

export default async function BecaProcessPage() {
    const session = await readVerifiedSession('BECA')
    if (!session) redirect('/solicitud-beca')
    const catalogs = await getScholarshipCatalogs()

    return <SolicitudBecaProcess email={session.email} catalogs={catalogs} />
}

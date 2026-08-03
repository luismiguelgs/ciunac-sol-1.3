import { redirect } from 'next/navigation'
import SolicitudBecaProcess from '@/modules/solicitud-beca/presentation/components/solicitud-beca-process'
import { readVerifiedSession } from '@/modules/security/server/session'

export default async function BecaProcessPage() {
    const session = await readVerifiedSession('BECA')
    if (!session) redirect('/solicitud-beca')

    return <SolicitudBecaProcess email={session.email} />
}

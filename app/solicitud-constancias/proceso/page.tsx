import { redirect } from 'next/navigation'
import SolicitudConstanciasProcess from '@/modules/solicitud-constancia/presentation/components/solicitud-constancia-process'
import { readVerifiedSession } from '@/modules/security/server/session'

export default async function SolicitudConstanciasProcesoPage() {
    const session = await readVerifiedSession('CONSTANCIA')
    if (!session) redirect('/solicitud-constancias')

    return <SolicitudConstanciasProcess email={session.email} />
}

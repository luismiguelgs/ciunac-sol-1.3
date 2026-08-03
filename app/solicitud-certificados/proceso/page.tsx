import { redirect } from 'next/navigation'
import SolicitudCertificadoProcess from '@/modules/solicitud-certificado/presentation/components/solicitud-certificado-process'
import { readVerifiedSession } from '@/modules/security/server/session'

type PageProps = {
    searchParams: Promise<{
        trabajador?: string
        antiguo?: string
    }>
}

export default async function SolicitudCertificadosPage({ searchParams }: PageProps) {
    const session = await readVerifiedSession('CERTIFICADO')
    if (!session) redirect('/solicitud-certificados')

    const params = await searchParams
    return (
        <SolicitudCertificadoProcess
            email={session.email}
            trabajador={params.trabajador === 'true'}
            antiguo={params.antiguo === 'true'}
        />
    )
}

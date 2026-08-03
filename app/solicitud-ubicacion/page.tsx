import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'
import VerifySchedules from '@/modules/solicitud-ubicacion/components/verify-schedules'
import CertificadosTable from '@/modules/consulta-certificado/components/certificados-table'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'

export const dynamic = 'force-dynamic'

const getCertificates = async () => {
    const res = await ciunacRequest<ITipoSolicitud[]>('tipossolicitud')
    return res
}

export default async function SolicitudUbicacionPage() 
{
	const certificados = await getCertificates()
	return (
		<div className="p-4">
             <h2 className="text-2xl font-bold uppercase text-center mb-6">
                Verificación de correo electrónico
            </h2>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
				<VerificacionEmail />

                {/* Right Column */}
				<div className="space-y-4">
					<VerifySchedules />
					<CertificadosTable data={certificados} />
				</div>
				
			</div>
		</div>
	)
}



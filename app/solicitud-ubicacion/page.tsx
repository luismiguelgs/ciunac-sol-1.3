import VerificacionEmail from '@/components/verificacion-email'
import { ITipoSolicitud } from '@/interfaces/types.interface'
import VerifySchedules from '@/modules/solicitud-ubicacion/components/verify-schedules'
import TypesService, { Collection } from '@/services/types.service'
import CertificadosTable from '@/components/certificados-table'

const getCertificates = async () => {
    const res = await TypesService.fetchItems<ITipoSolicitud>(Collection.Tiposolicitud)
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

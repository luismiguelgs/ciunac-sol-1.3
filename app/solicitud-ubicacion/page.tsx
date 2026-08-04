import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'
import VerifySchedules from '@/modules/solicitud-ubicacion/components/verify-schedules'
import CertificadosTable from '@/modules/consulta-certificado/components/certificados-table'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export const dynamic = 'force-dynamic'

const getUbicacionRates = async (): Promise<ITipoSolicitud[]> => {
    const res = await ciunacRequest<unknown>('tipossolicitud')
    if (res === null) return []

    const requestTypes = parseExternalResponse(
        externalRecordArraySchema,
        res,
        'La API devolvio tipos de solicitud no validos',
    ) as unknown as ITipoSolicitud[]

    return requestTypes.filter((item) => Number(item.id) === 7)
}

export default async function SolicitudUbicacionPage() 
{
	const ubicacionRates = await getUbicacionRates()
	return (
		<div className="p-4">
             <h2 className="text-2xl font-bold uppercase text-center mb-6">
                Verificación de correo electrónico
            </h2>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
				<VerificacionEmail priceTable={<CertificadosTable data={ubicacionRates} />} />

                {/* Right Column */}
				<div>
					<VerifySchedules />
				</div>
				
			</div>
		</div>
	)
}



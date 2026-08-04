import VerificacionEmail from '@/modules/shared/components/verificacion-email-view'
import FormEmailSolicitud from '@/modules/shared/components/form-email-solicitud'
import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'
import CertificadosTable from '@/modules/consulta-certificado/components/certificados-table'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export const dynamic = 'force-dynamic'

const getCertificates = async (): Promise<ITipoSolicitud[]> => {
	const res = await ciunacRequest<unknown>('tipossolicitud')
	if (res === null) return []
	return parseExternalResponse(externalRecordArraySchema, res, 'La API devolvio tipos de solicitud no validos') as unknown as ITipoSolicitud[]
}

export default async function SolicitudCertificadoPage() {
	const idsPermitidos: number[] = [1, 2, 3, 4]
	const tiposSolicitud = await getCertificates()
	const certificados = tiposSolicitud.filter((item) => idsPermitidos.includes(Number(item.id)))

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold uppercase text-center mb-6">
				Verificación de correo electrónico
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left Column */}
				<VerificacionEmail priceTable={<CertificadosTable data={certificados} />} />

				{/* Right Column */}
				<div>
					<FormEmailSolicitud path='solicitud-certificados' purpose="CERTIFICADO" />
				</div>
			</div>
		</div>
	)
}



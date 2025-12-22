import VerificacionEmail from '@/components/verificacion-email'
import FormEmailSolicitud from '@/modules/solicitud-certificado/components/form-email-solicitud'
import React from 'react'
import TypesService from '@/services/types.service'
import { ITipoSolicitud } from '@/interfaces/types.interface'
import CertificadosTable from '@/components/certificados-table'
import { Collection } from '@/services/types.service'

const getCertificates = async (): Promise<ITipoSolicitud[]> => {
	const res = await TypesService.fetchItems<ITipoSolicitud>(Collection.Tiposolicitud)
	return res
}

export default async function SolicitudCertificadoPage() 
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
					<FormEmailSolicitud />
					<CertificadosTable data={certificados} />
				</div>
			</div>
		</div>
	)
}

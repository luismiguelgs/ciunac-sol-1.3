import { ConsultaForm } from '@/modules/consultas'
import ConsultaPage from "@/modules/shared/components/consulta-wrapper"

export default function ConsultaSolicitudPage() 
{
	return (
		<ConsultaPage>
			<ConsultaForm solicitud='CERTIFICADO' />
		</ConsultaPage>
	)
}


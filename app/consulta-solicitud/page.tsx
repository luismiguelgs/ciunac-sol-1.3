import ConsultaForm from "@/modules/consulta-solicitud/components/consulta-form"
import ConsultaPage from "@/modules/shared/components/consulta-wrapper"

export default function ConsultaSolicitudPage() 
{
	return (
		<ConsultaPage>
			<ConsultaForm solicitud='CERTIFICADO' />
		</ConsultaPage>
	)
}


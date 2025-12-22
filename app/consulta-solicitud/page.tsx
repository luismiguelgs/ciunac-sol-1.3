import ConsultaForm from "@/components/consulta-form"
import ConsultaPage from "@/components/consulta-page"

export default function ConsultaSolicitudPage() 
{
	return (
		<ConsultaPage>
			<ConsultaForm solicitud='CERTIFICADO' />
		</ConsultaPage>
	)
}

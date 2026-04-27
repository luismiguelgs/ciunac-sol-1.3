import ConsultaPage from "@/modules/shared/components/consulta-wrapper"
import ConsultaForm from "@/modules/consulta-solicitud/components/consulta-form"

export default function ConsultaUbicacionPage() {
	return (
		<ConsultaPage>
			<ConsultaForm solicitud='EXAMEN' />
		</ConsultaPage>
	)
}


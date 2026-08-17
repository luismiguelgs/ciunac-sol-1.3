import { ConsultaForm } from '@/modules/consultas'
import ConsultaPage from '@/modules/shared/components/consulta-wrapper'

export default function ConsultaUbicacionPage() {
	return (
		<ConsultaPage>
			<ConsultaForm solicitud='EXAMEN' />
		</ConsultaPage>
	)
}


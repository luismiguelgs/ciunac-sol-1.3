import { redirect } from 'next/navigation'
import { readConsultationSession } from '@/modules/security/server/session'
import EmptyState from '@/modules/shared/components/empty-state'
import { createGetConsultationRequestsUseCase } from '@/modules/consultas/infrastructure/server/create-get-consultation-requests'
import ConsultationResults from '@/modules/consulta-solicitud/presentation/components/consultation-results'

type PageProps = {
  params: Promise<{ dni: string }>
}

export default async function ResultadoSolicitudPage({ params }: PageProps) {
  const { dni } = await params
  const consultation = await readConsultationSession('CERTIFICADO', dni)
  if (!consultation) redirect('/consulta-solicitud')

  const useCase = createGetConsultationRequestsUseCase()
  const result = await useCase.execute(dni, 'CERTIFICADO')

  if (result.requests.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <EmptyState
          title="No se encontraron solicitudes"
          description="No existen solicitudes disponibles para el documento consultado."
          href="/consulta-solicitud"
          actionLabel="Realizar otra consulta"
        />
      </main>
    )
  }

  return <ConsultationResults result={result} />
}

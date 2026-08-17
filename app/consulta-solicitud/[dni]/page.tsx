import { redirect } from 'next/navigation'
import { readConsultationSession } from '@/modules/security/server/session'
import EmptyState from '@/modules/shared/components/empty-state'
import { ConsultationResults } from '@/modules/consulta-solicitud'
import { getSolicitudConsultation } from '@/modules/consulta-solicitud/server'

type PageProps = {
  params: Promise<{ dni: string }>
}

export default async function ResultadoSolicitudPage({ params }: PageProps) {
  const { dni } = await params
  const consultation = await readConsultationSession('CERTIFICADO', dni)
  if (!consultation) redirect('/consulta-solicitud')

  const result = await getSolicitudConsultation({ documentNumber: dni })

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

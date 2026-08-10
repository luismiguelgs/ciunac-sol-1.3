import { notFound, redirect } from 'next/navigation'
import { createGetLocationConsultationUseCase } from '@/modules/consulta-ubicacion/infrastructure/server/create-get-location-consultation'
import LocationConsultationView from '@/modules/consulta-ubicacion/presentation/components/location-consultation-view'
import { readConsultationSession } from '@/modules/security/server/session'

type PageProps = {
  params: Promise<{ dni: string }>
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { dni } = await params
  const consultationSession = await readConsultationSession('EXAMEN', dni)
  if (!consultationSession) redirect('/consulta-ubicacion')

  const consultation = await createGetLocationConsultationUseCase().execute(dni)
  if (!consultation) notFound()

  return <LocationConsultationView consultation={consultation} />
}

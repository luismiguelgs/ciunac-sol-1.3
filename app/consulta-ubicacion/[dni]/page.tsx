import { notFound, redirect } from 'next/navigation'
import { LocationConsultationView } from '@/modules/consulta-ubicacion'
import { getLocationConsultation } from '@/modules/consulta-ubicacion/server'
import { readConsultationSession } from '@/modules/security/server/session'

type PageProps = {
  params: Promise<{ dni: string }>
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { dni } = await params
  const consultationSession = await readConsultationSession('EXAMEN', dni)
  if (!consultationSession) redirect('/consulta-ubicacion')

  const consultation = await getLocationConsultation({ documentNumber: dni })
  if (!consultation) notFound()

  return <LocationConsultationView consultation={consultation} />
}

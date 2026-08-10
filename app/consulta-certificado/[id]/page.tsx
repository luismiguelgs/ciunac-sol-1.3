import { notFound, redirect } from 'next/navigation'
import { normalizeCertificateLookupId } from '@/modules/consulta-certificado/domain/certificate-detail'
import { createGetCertificateDetailUseCase } from '@/modules/consulta-certificado/infrastructure/server/create-get-certificate-detail'
import CertificateDetailView from '@/modules/consulta-certificado/presentation/components/certificate-detail-view'
import { readConsultationSession } from '@/modules/security/server/session'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function GetCertificatePage({ params }: PageProps) {
  const consultation = await readConsultationSession('CERTIFICADO')
  if (!consultation) redirect('/consulta-solicitud')

  const { id: rawId } = await params
  const certificateId = normalizeCertificateLookupId(rawId)
  if (!certificateId) notFound()

  const certificate = await createGetCertificateDetailUseCase().execute({
    certificateId,
    consultationDocument: consultation.documento,
  })
  if (!certificate) notFound()

  return <CertificateDetailView certificate={certificate} />
}

import { notFound } from 'next/navigation'
import { CertificateDetailView } from '@/modules/consulta-certificado'
import { getCertificateDetail } from '@/modules/consulta-certificado/server'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function GetCertificatePage({ params }: PageProps) {
  const { id: rawId } = await params
  const certificate = await getCertificateDetail({
    certificateId: rawId,
  })
  if (!certificate) notFound()

  return <CertificateDetailView certificate={certificate} />
}

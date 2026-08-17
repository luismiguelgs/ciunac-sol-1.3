import 'server-only'

import {
  GetCertificateDetailUseCase,
  normalizeCertificateLookupId,
} from '@/modules/consulta-certificado/application/get-certificate-detail.use-case'
import type { CertificateDetailResult } from '@/modules/consulta-certificado/application/get-certificate-detail.use-case'
import { serverCertificateDetailRepository } from '@/modules/consulta-certificado/infrastructure/server/certificate-detail.repository'

export type GetCertificateDetailInput = {
  certificateId: string
}

const getCertificateDetailUseCase = new GetCertificateDetailUseCase(serverCertificateDetailRepository)

export async function getCertificateDetail(
  input: GetCertificateDetailInput,
): Promise<CertificateDetailResult | null> {
  const certificateId = normalizeCertificateLookupId(input.certificateId)
  if (!certificateId) return null

  return getCertificateDetailUseCase.execute({
    certificateId,
  })
}

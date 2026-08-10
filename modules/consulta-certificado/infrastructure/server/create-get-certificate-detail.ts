import 'server-only'

import { GetCertificateDetailUseCase } from '@/modules/consulta-certificado/application/get-certificate-detail.use-case'
import { serverCertificateDetailRepository } from '@/modules/consulta-certificado/infrastructure/server/certificate-detail.repository'

export function createGetCertificateDetailUseCase(): GetCertificateDetailUseCase {
  return new GetCertificateDetailUseCase(serverCertificateDetailRepository)
}

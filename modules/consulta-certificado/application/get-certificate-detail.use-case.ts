import {
  type CertificateDetail,
  sortCertificateNotes,
} from '@/modules/consulta-certificado/domain/certificate-detail'

export interface CertificateDetailPort {
  findById(id: string): Promise<CertificateDetail | null>
}

export type GetCertificateDetailQuery = {
  certificateId: string
}

export type CertificateDetailResult = CertificateDetail

export function normalizeCertificateLookupId(value: string): string | null {
  const id = value.trim()
  return /^[A-Za-z0-9_-]{1,80}$/.test(id) ? id : null
}

export class GetCertificateDetailUseCase {
  constructor(private readonly certificates: CertificateDetailPort) {}

  async execute(query: GetCertificateDetailQuery): Promise<CertificateDetailResult | null> {
    const certificate = await this.certificates.findById(query.certificateId)
    if (!certificate) return null

    return {
      ...certificate,
      notes: sortCertificateNotes(certificate.notes),
    }
  }
}

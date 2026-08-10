import {
  CertificateDetail,
  normalizeCertificateDocument,
  sortCertificateNotes,
} from '@/modules/consulta-certificado/domain/certificate-detail'

export interface CertificateDetailPort {
  findById(id: string): Promise<CertificateDetail | null>
}

export type GetCertificateDetailQuery = {
  certificateId: string
  consultationDocument: string
}

export class GetCertificateDetailUseCase {
  constructor(private readonly certificates: CertificateDetailPort) {}

  async execute(query: GetCertificateDetailQuery): Promise<CertificateDetail | null> {
    const certificate = await this.certificates.findById(query.certificateId)
    if (!certificate) return null

    const ownerDocument = normalizeCertificateDocument(certificate.documentNumber)
    const consultationDocument = normalizeCertificateDocument(query.consultationDocument)
    if (ownerDocument !== consultationDocument) return null

    return {
      ...certificate,
      notes: sortCertificateNotes(certificate.notes),
    }
  }
}

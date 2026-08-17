import { AppError } from '@/modules/shared/application/errors/app-error'
import type { CertificateStudentLookupPort } from '@/modules/solicitud-certificado/application/ports/certificate-read.ports'
import {
  isCertificateDocumentNumber,
  normalizeCertificateDocumentNumber,
  type CertificateStudentLookup,
} from '@/modules/solicitud-certificado/domain/solicitud-certificado'

export class FindCertificateStudentUseCase {
  constructor(private readonly studentLookup: CertificateStudentLookupPort) {}

  async execute(documentNumber: string): Promise<CertificateStudentLookup | null> {
    const normalizedDocument = normalizeCertificateDocumentNumber(documentNumber)
    if (!isCertificateDocumentNumber(normalizedDocument)) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El documento ingresado no es valido.',
      })
    }
    return await this.studentLookup.findByDocument(normalizedDocument)
  }
}

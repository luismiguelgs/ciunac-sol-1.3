import type {
  CertificateCargo,
  CertificateStudentLookup,
} from '@/modules/solicitud-certificado/domain/solicitud-certificado'

export interface CertificateStudentLookupPort {
  findByDocument(documentNumber: string): Promise<CertificateStudentLookup | null>
}

export interface CertificateCargoPort {
  findById(requestId: number): Promise<CertificateCargo | null>
}

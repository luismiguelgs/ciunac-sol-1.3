import type { DigitalDocument } from '@/modules/consulta-solicitud/domain/digital-document'
import type {
  CertificateDigitalDocumentResponseDto,
  ConstanciaDigitalDocumentResponseDto,
} from '@/modules/consulta-solicitud/infrastructure/validation/digital-document.schemas'

export function toCertificateDigitalDocument(
  dto: CertificateDigitalDocumentResponseDto,
): DigitalDocument {
  return {
    kind: 'certificate',
    id: String(dto._id ?? dto.id),
    requestId: dto.solicitudId,
    documentNumber: dto.numeroDocumento,
    descriptor: dto.idioma,
    level: dto.nivel,
    url: dto.url,
    accepted: dto.aceptado,
    issuedAt: dto.fechaEmision,
  }
}

export function toConstanciaDigitalDocument(
  dto: ConstanciaDigitalDocumentResponseDto,
): DigitalDocument {
  return {
    kind: 'constancia',
    id: String(dto._id ?? dto.id),
    requestId: dto.solicitudId,
    documentNumber: dto.numeroDocumento,
    descriptor: dto.tipo,
    level: dto.nivel,
    url: dto.url,
    accepted: dto.aceptado,
    issuedAt: dto.fechaEmision,
  }
}

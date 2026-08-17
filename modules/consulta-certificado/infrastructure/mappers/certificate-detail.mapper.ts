import type { CertificateDetail } from '@/modules/consulta-certificado/domain/certificate-detail'
import type { CertificateDetailResponseDto } from '@/modules/consulta-certificado/infrastructure/validation/certificate-detail.schemas'

export function toCertificateDetail(dto: CertificateDetailResponseDto): CertificateDetail {
  return {
    id: dto._id,
    type: dto.tipo,
    studentName: dto.estudiante,
    language: dto.idioma,
    level: dto.nivel,
    hours: dto.cantidadHoras,
    requestId: dto.solicitudId,
    issuedAt: dto.fechaEmision,
    registrationNumber: dto.numeroRegistro,
    completedAt: dto.fechaConcluido,
    delivery: dto.aceptado && dto.fechaAceptacion
      ? { status: 'accepted', acceptedAt: dto.fechaAceptacion }
      : { status: 'pending', acceptedAt: null },
    notes: dto.notas.map((note) => ({
      cycle: note.ciclo,
      period: note.periodo,
      modality: note.modalidad,
      grade: note.nota,
    })),
  }
}

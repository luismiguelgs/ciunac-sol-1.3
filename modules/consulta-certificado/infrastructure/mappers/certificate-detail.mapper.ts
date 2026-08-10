import { CertificateDetail } from '@/modules/consulta-certificado/domain/certificate-detail'
import { CertificateDetailResponseDto } from '@/modules/consulta-certificado/infrastructure/dto/certificate-detail.dto'

export function toCertificateDetail(dto: CertificateDetailResponseDto): CertificateDetail {
  return {
    id: dto._id,
    type: dto.tipo,
    studentName: dto.estudiante,
    documentNumber: dto.numeroDocumento,
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

import type {
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
  LocationRequest,
  LocationText,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import type {
  LocationCycleResponseDto,
  LocationExamResponseDto,
  LocationPlacementResponseDto,
} from '@/modules/consulta-ubicacion/infrastructure/validation/location-consultation.schemas'
import type { ConsultedRequest, ConsultationText } from '@/modules/consultas'

export function toLocationRequest(request: ConsultedRequest): LocationRequest | null {
  if (request.requestType.kind !== 'location') return null

  return {
    id: request.id,
    student: { ...request.student },
    requestType: {
      id: request.requestType.id,
      name: request.requestType.name,
    },
    language: { ...request.language },
    level: { ...request.level },
    createdAt: request.createdAt,
    payment: { ...request.payment },
  }
}

export function toLocationText(text: ConsultationText): LocationText {
  return { code: text.code, content: text.content }
}

export function toLocationExam(dto: LocationExamResponseDto): LocationExam {
  return { id: dto.id, occurredAt: dto.fecha }
}

export function toLocationCycle(dto: LocationCycleResponseDto): LocationCycle {
  return { id: dto.id, name: dto.nombre }
}

export function toLocationPlacementRecord(dto: LocationPlacementResponseDto): LocationPlacementRecord {
  return {
    id: dto.id,
    examId: dto.examenId,
    requestId: dto.solicitudId,
    grade: dto.nota,
    completed: dto.terminado,
    student: dto.estudiante ? {
      id: dto.estudiante.id,
      names: dto.estudiante.nombres,
      lastNames: dto.estudiante.apellidos,
      documentNumber: dto.estudiante.numeroDocumento,
    } : null,
    language: { id: dto.idioma.id, name: dto.idioma.nombre },
    evaluatedLevel: { id: dto.nivel.id, name: dto.nivel.nombre },
    cycleId: dto.calificacion?.cicloId ?? null,
  }
}

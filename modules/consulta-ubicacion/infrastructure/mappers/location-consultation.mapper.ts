import {
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import {
  LocationCycleResponseDto,
  LocationExamResponseDto,
  LocationPlacementResponseDto,
} from '@/modules/consulta-ubicacion/infrastructure/dto/location-consultation.dto'

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

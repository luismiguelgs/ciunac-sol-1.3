import { describe, expect, it, vi } from 'vitest'
import { GetLocationConsultationUseCase } from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import {
  canGenerateLocationCertificate,
  joinLocationExamResults,
  LocationPlacementRecord,
  selectLatestLocationRequest,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import {
  toLocationCycle,
  toLocationExam,
  toLocationPlacementRecord,
} from '@/modules/consulta-ubicacion/infrastructure/mappers/location-consultation.mapper'
import {
  locationCycleArrayResponseSchema,
  locationExamArrayResponseSchema,
  locationPlacementArrayResponseSchema,
} from '@/modules/consulta-ubicacion/infrastructure/validation/location-consultation.schemas'
import { ConsultedRequest } from '@/modules/consultas/domain/consulted-request'

describe('location consultation runtime contracts', () => {
  it('validates and maps exams, cycles and placement records', () => {
    const examDto = locationExamArrayResponseSchema.parse([{ id: '501', fecha: '2026-07-20T15:00:00.000Z' }])[0]
    const cycleDto = locationCycleArrayResponseSchema.parse([{ id: 2, nombre: 'BASICO 2' }])[0]
    const placementDto = locationPlacementArrayResponseSchema.parse([placementResponse()])[0]

    expect(toLocationExam(examDto)).toEqual({ id: 501, occurredAt: '2026-07-20T15:00:00.000Z' })
    expect(toLocationCycle(cycleDto)).toEqual({ id: 2, name: 'BASICO 2' })
    expect(toLocationPlacementRecord(placementDto)).toMatchObject({
      id: 601,
      examId: 501,
      requestId: 1002,
      grade: 88,
      completed: true,
      cycleId: 2,
      student: { documentNumber: '12345678' },
    })
  })

  it.each([
    ['invalid exam date', () => locationExamArrayResponseSchema.safeParse([{ id: 501, fecha: 'invalid' }])],
    ['invalid cycle id', () => locationCycleArrayResponseSchema.safeParse([{ id: 0, nombre: 'BASICO 2' }])],
    ['incomplete student', () => locationPlacementArrayResponseSchema.safeParse([{ ...placementResponse(), estudiante: { id: 'student-1' } }])],
    ['grade above 100', () => locationPlacementArrayResponseSchema.safeParse([{ ...placementResponse(), nota: 101 }])],
    ['missing language', () => locationPlacementArrayResponseSchema.safeParse([{ ...placementResponse(), idioma: null }])],
  ])('rejects %s', (_label, parse) => {
    expect(parse().success).toBe(false)
  })

  it('allows a missing qualification as an explicit partial relation', () => {
    const result = locationPlacementArrayResponseSchema.parse([{ ...placementResponse(), calificacion: null }])[0]
    expect(toLocationPlacementRecord(result).cycleId).toBeNull()
  })

  it('allows an omitted student and defers it to the owned request relation', () => {
    const result = locationPlacementArrayResponseSchema.parse([{ ...placementResponse(), estudiante: undefined }])[0]
    expect(toLocationPlacementRecord(result).student).toBeNull()
  })
})

describe('location consultation join', () => {
  it('joins valid relations and filters foreign requests and documents', () => {
    const valid = placementRecord()
    if (!valid.student) throw new Error('The test fixture requires a student')
    const results = joinLocationExamResults(
      [
        valid,
        { ...valid, id: 602, requestId: 9999 },
        { ...valid, id: 603, student: { ...valid.student, documentNumber: '87654321' } },
      ],
      [{ id: 501, occurredAt: '2026-07-20T15:00:00.000Z' }],
      [{ id: 2, name: 'BASICO 2' }],
      [request()],
      '12345678',
    )

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      id: 601,
      examDate: '2026-07-20T15:00:00.000Z',
      placementCycle: 'BASICO 2',
      dataQuality: 'complete',
    })
  })

  it('preserves a result with explicit partial quality when a relation is absent', () => {
    const [result] = joinLocationExamResults(
      [placementRecord()],
      [],
      [],
      [request()],
      '12345678',
    )

    expect(result).toMatchObject({ examDate: null, placementCycle: null, dataQuality: 'partial' })
    expect(canGenerateLocationCertificate(result, 'AÑO ACADÉMICO 2026')).toBe(false)
  })

  it('selects the latest location request deterministically', () => {
    const older = request({ id: 1002, createdAt: '2026-01-01T00:00:00.000Z' })
    const newer = request({ id: 1004, createdAt: '2026-06-01T00:00:00.000Z' })
    expect(selectLatestLocationRequest([older, newer])?.id).toBe(1004)
  })
})

describe('get location consultation use case', () => {
  it('returns joined results and the institutional year', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute('12345678')

    expect(result).toMatchObject({
      documentNumber: '12345678',
      activeRequestId: 1002,
      yearName: 'AÑO ACADÉMICO 2026',
      textStatus: 'available',
    })
    expect(result?.results[0]).toMatchObject({ placementCycle: 'BASICO 2', dataQuality: 'complete' })
    expect(canGenerateLocationCertificate(result!.results[0], result!.yearName)).toBe(true)
  })

  it('keeps results when auxiliary texts fail and disables a complete PDF', async () => {
    const useCase = createUseCase({ textFailure: true })
    const result = await useCase.execute('12345678')

    expect(result).toMatchObject({ yearName: null, textStatus: 'unavailable' })
    expect(result?.results).toHaveLength(1)
    expect(canGenerateLocationCertificate(result!.results[0], result!.yearName)).toBe(false)
  })

  it('returns not found when no owned location request exists', async () => {
    const useCase = createUseCase({ requests: [request({
      student: { ...request().student, documentNumber: '87654321' },
    })] })
    await expect(useCase.execute('12345678')).resolves.toBeNull()
  })
})

function createUseCase(options: { requests?: ConsultedRequest[]; textFailure?: boolean } = {}) {
  return new GetLocationConsultationUseCase({
    requests: { findByDocument: vi.fn().mockResolvedValue(options.requests ?? [request()]) },
    placements: { findByDocument: vi.fn().mockResolvedValue([placementRecord()]) },
    exams: { list: vi.fn().mockResolvedValue([{ id: 501, occurredAt: '2026-07-20T15:00:00.000Z' }]) },
    cycles: { list: vi.fn().mockResolvedValue([{ id: 2, name: 'BASICO 2' }]) },
    texts: {
      list: options.textFailure
        ? vi.fn().mockRejectedValue(new Error('text provider failed'))
        : vi.fn().mockResolvedValue([{ code: 'TEXTO_NOMBREAN', content: 'AÑO ACADÉMICO 2026' }]),
    },
  })
}

function placementResponse() {
  return {
    id: 601,
    examenId: 501,
    solicitudId: 1002,
    nota: 88,
    terminado: true,
    estudiante: { id: 'student-1', nombres: 'MARIA', apellidos: 'PEREZ', numeroDocumento: '12345678' },
    idioma: { id: 2, nombre: 'INGLES' },
    nivel: { id: 1, nombre: 'BASICO' },
    calificacion: { cicloId: 2 },
  }
}

function placementRecord(): LocationPlacementRecord {
  return {
    id: 601,
    examId: 501,
    requestId: 1002,
    grade: 88,
    completed: true,
    student: { id: 'student-1', names: 'MARIA', lastNames: 'PEREZ', documentNumber: '12345678' },
    language: { id: 2, name: 'INGLES' },
    evaluatedLevel: { id: 1, name: 'BASICO' },
    cycleId: 2,
  }
}

function request(override: Partial<ConsultedRequest> = {}): ConsultedRequest {
  return {
    id: 1002,
    student: { id: 'student-1', names: 'MARIA', lastNames: 'PEREZ', documentNumber: '12345678' },
    requestType: { id: 7, name: 'EXAMEN DE UBICACION', kind: 'location' },
    language: { id: 2, name: 'INGLES' },
    level: { id: 1, name: 'BASICO' },
    status: { id: 2, name: 'ASIGNADO', reference: 'EN PROCESO', step: 'processing' },
    createdAt: '2026-01-01T00:00:00.000Z',
    digital: false,
    observations: null,
    payment: { amount: 80, voucherNumber: '123456789012345', paidAt: '2026-01-01T00:00:00.000Z' },
    ...override,
  }
}

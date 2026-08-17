import { describe, expect, it, vi } from 'vitest'
import { GetLocationConsultationUseCase } from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import type { LocationContextPort } from '@/modules/consulta-ubicacion/application/ports/location-consultation.port'
import {
  canGenerateLocationCertificate,
  joinLocationExamResults,
  type LocationPlacementRecord,
  type LocationRequest,
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
import { presentLocationConsultation } from '@/modules/consulta-ubicacion/presentation/location-consultation.presenter'

describe('location consultation runtime contracts', () => {
  it('validates and maps exams, cycles and placement records', () => {
    const examDto = locationExamArrayResponseSchema.parse([{ id: '501', fecha: '2026-07-20T15:00:00.000Z' }])[0]
    const cycleDto = locationCycleArrayResponseSchema.parse([{ id: 2, nombre: 'BÁSICO 2' }])[0]
    const placementDto = locationPlacementArrayResponseSchema.parse([placementResponse()])[0]

    expect(toLocationExam(examDto)).toEqual({ id: 501, occurredAt: '2026-07-20T15:00:00.000Z' })
    expect(toLocationCycle(cycleDto)).toEqual({ id: 2, name: 'BÁSICO 2' })
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
    ['invalid cycle id', () => locationCycleArrayResponseSchema.safeParse([{ id: 0, nombre: 'BÁSICO 2' }])],
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
      [{ id: 2, name: 'BÁSICO 2' }],
      [request()],
      '12345678',
    )

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      id: 601,
      examDate: '2026-07-20T15:00:00.000Z',
      placementCycle: 'BÁSICO 2',
      dataQuality: 'complete',
    })
  })

  it('preserves a result with explicit partial quality when a relation is absent', () => {
    const [result] = joinLocationExamResults([placementRecord()], [], [], [request()], '12345678')

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
  it('returns joined results, cargo and the institutional year', async () => {
    const result = await createUseCase().execute('12345678')

    expect(result).toMatchObject({
      documentNumber: '12345678',
      activeRequestId: 1002,
      yearName: 'AÑO ACADÉMICO 2026',
      textStatus: 'available',
      cargo: { amount: 30, requestId: 1002 },
    })
    expect(result?.results[0]).toMatchObject({
      placementCycle: 'BÁSICO 2',
      dataQuality: 'complete',
      certificateAvailable: true,
    })
  })

  it('keeps results when auxiliary texts are unavailable and disables the PDF', async () => {
    const result = await createUseCase({ textFailure: true }).execute('12345678')

    expect(result).toMatchObject({ yearName: null, textStatus: 'unavailable' })
    expect(result?.results).toHaveLength(1)
    expect(result?.results[0].certificateAvailable).toBe(false)
  })

  it('returns not found when no owned location request exists', async () => {
    const result = createUseCase({
      requests: [request({
        student: { ...request().student, documentNumber: '87654321' },
      })],
    }).execute('12345678')

    await expect(result).resolves.toBeNull()
  })

  it('rejects an invalid document before calling dependencies', async () => {
    const load = vi.fn<LocationContextPort['load']>()
    const useCase = createUseCase({ context: { load } })

    await expect(useCase.execute('invalid')).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(load).not.toHaveBeenCalled()
  })
})

describe('location consultation presenter', () => {
  it('builds a certificate and an A4 cargo model from the active request', async () => {
    const consultation = await createUseCase().execute('12345678')
    if (!consultation) throw new Error('The test fixture requires a consultation')

    const viewModel = presentLocationConsultation(consultation)

    expect(viewModel).toMatchObject({
      fullName: 'MARIA PEREZ',
      yearAvailable: true,
      results: [{
        dateLabel: '20/7/2026',
        gradeLabel: '88/100',
        certificate: { status: 'available' },
      }],
      cargo: {
        status: 'available',
        fileName: 'UBICACION-12345678-1002.pdf',
        document: { title: 'CARGO PARA EXAMEN DE UBICACIÓN' },
      },
    })
    if (viewModel.cargo.status !== 'available') throw new Error('The test fixture requires a cargo')
    expect(viewModel.cargo.document.fields).toContainEqual({ label: 'Pago', value: 'S/30.00' })
  })

  it('reports an unavailable cargo when institutional texts are incomplete', async () => {
    const consultation = await createUseCase({ textFailure: true }).execute('12345678')
    if (!consultation) throw new Error('The test fixture requires a consultation')

    expect(presentLocationConsultation(consultation).cargo.status).toBe('unavailable')
  })
})

type CreateUseCaseOptions = {
  requests?: LocationRequest[]
  textFailure?: boolean
  context?: LocationContextPort
}

function createUseCase(options: CreateUseCaseOptions = {}) {
  const context: LocationContextPort = options.context ?? {
    load: vi.fn().mockResolvedValue({
      requests: options.requests ?? [request()],
      texts: options.textFailure ? [] : cargoTexts(),
      textStatus: options.textFailure ? 'unavailable' : 'available',
    }),
  }

  return new GetLocationConsultationUseCase({
    context,
    placements: { findByDocument: vi.fn().mockResolvedValue([placementRecord()]) },
    exams: { list: vi.fn().mockResolvedValue([{ id: 501, occurredAt: '2026-07-20T15:00:00.000Z' }]) },
    cycles: { list: vi.fn().mockResolvedValue([{ id: 2, name: 'BÁSICO 2' }]) },
  })
}

function cargoTexts() {
  return [
    { code: 'TEXTO_NOMBREAN', content: 'AÑO ACADÉMICO 2026' },
    { code: 'TEXTO_UBICACION_3', content: 'Se registró la solicitud.' },
    { code: 'TEXTO_UBICACION_4', content: 'Conserve este cargo.' },
  ]
}

function placementResponse() {
  return {
    id: 601,
    examenId: 501,
    solicitudId: 1002,
    nota: 88,
    terminado: true,
    estudiante: { id: 'student-1', nombres: 'MARIA', apellidos: 'PEREZ', numeroDocumento: '12345678' },
    idioma: { id: 2, nombre: 'INGLÉS' },
    nivel: { id: 1, nombre: 'BÁSICO' },
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
    language: { id: 2, name: 'INGLÉS' },
    evaluatedLevel: { id: 1, name: 'BÁSICO' },
    cycleId: 2,
  }
}

function request(override: Partial<LocationRequest> = {}): LocationRequest {
  return {
    id: 1002,
    student: { id: 'student-1', names: 'MARIA', lastNames: 'PEREZ', documentNumber: '12345678' },
    requestType: { id: 7, name: 'EXAMEN DE UBICACIÓN' },
    language: { id: 2, name: 'INGLÉS' },
    level: { id: 1, name: 'BÁSICO' },
    createdAt: '2026-01-01T00:00:00.000Z',
    payment: { amount: 30, voucherNumber: '123456789012345', paidAt: '2026-01-01T00:00:00.000Z' },
    ...override,
  }
}

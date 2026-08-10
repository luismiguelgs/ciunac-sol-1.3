import { describe, expect, it, vi } from 'vitest'
import { GetCertificateDetailUseCase } from '@/modules/consulta-certificado/application/get-certificate-detail.use-case'
import {
  CertificateDetail,
  normalizeCertificateLookupId,
  resolveCertificateCourseLabels,
  sortCertificateNotes,
} from '@/modules/consulta-certificado/domain/certificate-detail'
import { toCertificateDetail } from '@/modules/consulta-certificado/infrastructure/mappers/certificate-detail.mapper'
import { certificateDetailResponseSchema } from '@/modules/consulta-certificado/infrastructure/validation/certificate-detail.schemas'

describe('certificate detail runtime contract', () => {
  it('validates and maps a complete certificate', () => {
    const dto = certificateDetailResponseSchema.parse(certificateResponse())
    expect(toCertificateDetail(dto)).toMatchObject({
      id: 'CERT-1',
      type: 'VIRTUAL',
      studentName: 'MARIA PEREZ',
      documentNumber: '12345678',
      language: 'INGLES',
      level: 'BASICO',
      hours: 180,
      requestId: 1001,
      registrationNumber: 'REG-001',
      delivery: { status: 'pending', acceptedAt: null },
    })
  })

  it.each([
    ['missing student', { estudiante: '' }],
    ['invalid issue date', { fechaEmision: 'not-a-date' }],
    ['invalid request id', { solicitudId: 0 }],
    ['invalid notes', { notas: [{ ciclo: '', nota: 90 }] }],
    ['accepted without date', { aceptado: true, fechaAceptacion: '' }],
  ])('rejects %s', (_label, override) => {
    expect(certificateDetailResponseSchema.safeParse({ ...certificateResponse(), ...override }).success).toBe(false)
  })

  it('accepts an empty notes list as a valid empty state', () => {
    const result = certificateDetailResponseSchema.parse({ ...certificateResponse(), notas: [] })
    expect(result.notas).toEqual([])
  })
})

describe('certificate detail domain', () => {
  it('normalizes safe identifiers and rejects path-like values', () => {
    expect(normalizeCertificateLookupId(' CERT_2026-1 ')).toBe('CERT_2026-1')
    expect(normalizeCertificateLookupId('../CERT-1')).toBeNull()
    expect(normalizeCertificateLookupId('CERT!1')).toBeNull()
  })

  it('sorts cycles by their trailing number while preserving stable fallback order', () => {
    const notes = certificate().notes
    expect(sortCertificateNotes(notes).map((note) => note.cycle)).toEqual([
      'INGLES 1',
      'INGLES 2',
      'CURSO ESPECIAL',
    ])
  })

  it('derives the visible language and level with a safe fallback', () => {
    expect(resolveCertificateCourseLabels(certificate())).toEqual({ language: 'INGLES', level: '2' })
    expect(resolveCertificateCourseLabels({ ...certificate(), notes: [] })).toEqual({
      language: 'INGLES',
      level: 'BASICO',
    })
  })
})

describe('get certificate detail use case', () => {
  it('returns a sorted certificate when it belongs to the consultation document', async () => {
    const findById = vi.fn().mockResolvedValue(certificate())
    const useCase = new GetCertificateDetailUseCase({ findById })

    const result = await useCase.execute({
      certificateId: 'CERT-1',
      consultationDocument: '12345678',
    })

    expect(findById).toHaveBeenCalledWith('CERT-1')
    expect(result?.notes.map((note) => note.cycle)).toEqual(['INGLES 1', 'INGLES 2', 'CURSO ESPECIAL'])
  })

  it('hides a certificate owned by another document', async () => {
    const useCase = new GetCertificateDetailUseCase({
      findById: vi.fn().mockResolvedValue(certificate()),
    })

    await expect(useCase.execute({
      certificateId: 'CERT-1',
      consultationDocument: '87654321',
    })).resolves.toBeNull()
  })

  it('keeps an absent certificate as an explicit empty result', async () => {
    const useCase = new GetCertificateDetailUseCase({
      findById: vi.fn().mockResolvedValue(null),
    })

    await expect(useCase.execute({
      certificateId: 'CERT-404',
      consultationDocument: '12345678',
    })).resolves.toBeNull()
  })
})

function certificateResponse(override: Record<string, unknown> = {}) {
  return {
    _id: 'CERT-1',
    tipo: 'VIRTUAL',
    estudiante: 'MARIA PEREZ',
    numeroDocumento: '12345678',
    idioma: 'INGLES',
    nivel: 'BASICO',
    cantidadHoras: 180,
    solicitudId: 1001,
    fechaEmision: '2026-07-15T00:00:00.000Z',
    numeroRegistro: 'REG-001',
    fechaConcluido: '2026-06-30T00:00:00.000Z',
    aceptado: false,
    fechaAceptacion: '',
    notas: [{ ciclo: 'INGLES 1', periodo: '2025-1', modalidad: 'REGULAR', nota: 90 }],
    ...override,
  }
}

function certificate(): CertificateDetail {
  return {
    id: 'CERT-1',
    type: 'VIRTUAL',
    studentName: 'MARIA PEREZ',
    documentNumber: '12345678',
    language: 'INGLES',
    level: 'BASICO',
    hours: 180,
    requestId: 1001,
    issuedAt: '2026-07-15T00:00:00.000Z',
    registrationNumber: 'REG-001',
    completedAt: '2026-06-30T00:00:00.000Z',
    delivery: { status: 'pending', acceptedAt: null },
    notes: [
      { cycle: 'INGLES 2', period: '2025-2', modality: 'REGULAR', grade: 95 },
      { cycle: 'CURSO ESPECIAL', period: '2025-3', modality: 'REGULAR', grade: 94 },
      { cycle: 'INGLES 1', period: '2025-1', modality: 'REGULAR', grade: 90 },
    ],
  }
}

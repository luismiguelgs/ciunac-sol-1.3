import { describe, expect, it } from 'vitest'
import {
  normalizeCertificateLookupId,
  parseCertificateDetailResponse,
  certificateDetailResponseSchema,
} from '@/modules/consulta-certificado/infrastructure/certificate-detail.contract'
import {
  CertificateDetail,
  sortCertificateNotes,
} from '@/modules/consulta-certificado/domain/certificate-detail'
import {
  formatCertificateDate,
  formatCertificateLevel,
  presentCertificateDetail,
} from '@/modules/consulta-certificado/presentation/certificate-detail.presenter'

describe('certificate detail runtime contract', () => {
  it('validates and maps a complete certificate', () => {
    expect(parseCertificateDetailResponse(certificateResponse(), 'CERT-1')).toMatchObject({
      studentName: 'MARIA PEREZ',
      language: 'INGLES',
      level: 'BASICO',
      hours: 180,
      registrationNumber: 'REG-001',
      delivery: { status: 'pending', acceptedAt: null },
    })
  })

  it.each([
    ['missing student', { estudiante: '' }],
    ['invalid issue date', { fechaEmision: 'not-a-date' }],
    ['invalid notes', { notas: [{ ciclo: '', nota: 90 }] }],
    ['accepted without date', { aceptado: true, fechaAceptacion: '' }],
  ])('rejects %s', (_label, override) => {
    expect(certificateDetailResponseSchema.safeParse({ ...certificateResponse(), ...override }).success).toBe(false)
  })

  it('accepts an empty notes list as a valid empty state', () => {
    const result = certificateDetailResponseSchema.parse({ ...certificateResponse(), notas: [] })
    expect(result.notas).toEqual([])
  })

  it('normalizes nullable legacy delivery data without exposing the document number', () => {
    const detail = parseCertificateDetailResponse({
      ...certificateResponse(),
      numeroDocumento: null,
      aceptado: null,
    }, 'CERT-1')

    expect(detail.delivery).toEqual({ status: 'pending', acceptedAt: null })
    expect(detail).not.toHaveProperty('documentNumber')
  })

  it('strips unknown external fields before they reach the public model', () => {
    const dto = certificateDetailResponseSchema.parse({
      ...certificateResponse(),
      numeroDocumento: '12345678',
      internalSecret: 'not-public',
    })

    expect(dto).not.toHaveProperty('numeroDocumento')
    expect(dto).not.toHaveProperty('internalSecret')
  })

  it('rejects a response that belongs to another certificate id', () => {
    expect(() => parseCertificateDetailResponse(certificateResponse(), 'CERT-OTHER')).toThrow(
      /no corresponde a la consulta/i,
    )
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

})

describe('certificate detail presenter', () => {
  it('derives visible labels and formatted delivery data', () => {
    expect(presentCertificateDetail(certificate())).toMatchObject({
      courseLanguage: 'INGLES',
      courseLevel: 'BÁSICO',
      delivered: 'No',
      acceptedAt: null,
    })

    expect(presentCertificateDetail({
      ...certificate(),
      delivery: { status: 'accepted', acceptedAt: '2026-08-10T00:00:00.000Z' },
    })).toMatchObject({
      delivered: 'Sí',
      acceptedAt: formatCertificateDate('2026-08-10T00:00:00.000Z'),
    })
  })

  it('uses domain labels as fallback when the certificate has no notes', () => {
    expect(presentCertificateDetail({ ...certificate(), notes: [] })).toMatchObject({
      courseLanguage: 'INGLES',
      courseLevel: 'BÁSICO',
    })
  })

  it('uses the explicit language instead of deriving it from a cycle label', () => {
    expect(presentCertificateDetail({
      ...certificate(),
      language: 'FRANCES',
      notes: [{ cycle: 'INGLES 1', modality: 'REGULAR', grade: 90 }],
    }).courseLanguage).toBe('FRANCES')
  })

  it('returns a safe label for an invalid date', () => {
    expect(formatCertificateDate('not-a-date')).toBe('No disponible')
  })

  it.each([
    ['BASICO 1', 'BÁSICO'],
    ['BÁSICO 2', 'BÁSICO'],
    ['INTERMEDIO 3', 'INTERMEDIO'],
    ['AVANZADO 1', 'AVANZADO'],
  ])('shows %s as the level category %s', (level, expected) => {
    expect(formatCertificateLevel(level)).toBe(expected)
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
    studentName: 'MARIA PEREZ',
    language: 'INGLES',
    level: 'BASICO',
    hours: 180,
    issuedAt: '2026-07-15T00:00:00.000Z',
    registrationNumber: 'REG-001',
    completedAt: '2026-06-30T00:00:00.000Z',
    delivery: { status: 'pending', acceptedAt: null },
    notes: [
      { cycle: 'INGLES 2', modality: 'REGULAR', grade: 95 },
      { cycle: 'CURSO ESPECIAL', modality: 'REGULAR', grade: 94 },
      { cycle: 'INGLES 1', modality: 'REGULAR', grade: 90 },
    ],
  }
}

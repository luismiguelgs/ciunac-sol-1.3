import { afterEach, describe, expect, it, vi } from 'vitest'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { ADMINISTRATIVE_CARGO_PAGE_SIZE } from '@/modules/shared/components/administrative-cargo-pdf'
import { GetConsultationRequestsUseCase } from '@/modules/consultas/application/get-consultation-requests.use-case'
import {
  matchesConsultationType,
  normalizeConsultationDocument,
  resolveRequestKind,
  resolveRequestStep,
} from '@/modules/consultas/domain/consulted-request'
import { toConsultedRequest } from '@/modules/consultas/infrastructure/mappers/consultation.mapper'
import {
  consultationCheckResponseSchema,
  consultedRequestArrayResponseSchema,
} from '@/modules/consultas/infrastructure/validation/consultation.schemas'
import { GetDigitalDocumentUseCase } from '@/modules/consulta-solicitud/application/use-cases/get-digital-document.use-case'
import { AcceptDigitalDocumentUseCase } from '@/modules/consulta-solicitud/application/use-cases/accept-digital-document.use-case'
import type { DigitalDocumentPort } from '@/modules/consulta-solicitud/application/ports/digital-document.port'
import { ApiDigitalDocumentGateway } from '@/modules/consulta-solicitud/infrastructure/api/digital-document.gateway'
import { toConsultationCargoDocument } from '@/modules/consulta-solicitud/presentation/consultation-cargo.presenter'
import {
  certificateDigitalDocumentResponseSchema,
  constanciaDigitalDocumentResponseSchema,
} from '@/modules/consulta-solicitud/infrastructure/validation/digital-document.schemas'

describe('consultation request contracts', () => {
  it('validates and maps a complete backend request', () => {
    const dto = consultedRequestArrayResponseSchema.parse([requestResponse()])[0]
    expect(toConsultedRequest(dto)).toEqual({
      id: 1001,
      student: { id: 'student-1', names: 'Maria', lastNames: 'Perez', documentNumber: '12345678' },
      requestType: { id: 1, name: 'CERTIFICADO DE ESTUDIOS', kind: 'certificate' },
      language: { id: 2, name: 'INGLES' },
      level: { id: 1, name: 'BASICO' },
      status: { id: 1, name: 'NUEVO', reference: 'REGISTRADO', step: 'registered' },
      createdAt: '2026-08-01T00:00:00.000Z',
      digital: false,
      observations: null,
      payment: { amount: 50, voucherNumber: '123456789012345', paidAt: '2026-08-01T00:00:00.000Z' },
    })
  })

  it.each([
    ['empty student', { estudiante: null }],
    ['missing request type', { tiposSolicitud: undefined }],
    ['invalid date', { creadoEn: 'not-a-date' }],
    ['inconsistent type id', { tipoSolicitudId: 5 }],
    ['inconsistent status id', { estadoId: 3 }],
  ])('rejects %s', (_label, override) => {
    expect(consultedRequestArrayResponseSchema.safeParse([{ ...requestResponse(), ...override }]).success).toBe(false)
  })

  it('normalizes empty optional payment fields', () => {
    const result = consultedRequestArrayResponseSchema.parse([{
      ...requestResponse(),
      pago: 0,
      numeroVoucher: '',
      fechaPago: '',
    }])[0]
    expect(result.numeroVoucher).toBeNull()
    expect(result.fechaPago).toBeNull()
  })

  it('resolves request kinds and workflow steps without UI casts', () => {
    expect(resolveRequestKind(5, 'CONSTANCIA')).toBe('constancia')
    expect(resolveRequestKind(7, 'EXAMEN DE UBICACION')).toBe('location')
    expect(resolveRequestKind(99, 'OTRO')).toBe('other')
    expect(resolveRequestStep(1, 'NUEVO')).toBe('registered')
    expect(resolveRequestStep(3, 'PARA RECOGER')).toBe('ready')
    expect(resolveRequestStep(5, 'RECHAZADO')).toBe('rejected')
    expect(resolveRequestStep(2, 'ASIGNADO')).toBe('processing')
  })

  it('normalizes documents and validates the security response', () => {
    expect(normalizeConsultationDocument(' ab123456 ')).toBe('AB123456')
    expect(() => normalizeConsultationDocument('../12345')).toThrow()
    expect(consultationCheckResponseSchema.safeParse({ ok: true, found: false }).success).toBe(true)
    expect(consultationCheckResponseSchema.safeParse({ ok: true, found: null }).success).toBe(false)
  })
})

describe('consultation use case', () => {
  it('filters location requests out of certificate consultations', async () => {
    const certificate = toConsultedRequest(consultedRequestArrayResponseSchema.parse([requestResponse()])[0])
    const locationDto = requestResponse({
      id: 1002,
      tipoSolicitudId: 7,
      tiposSolicitud: { id: 7, solicitud: 'EXAMEN DE UBICACION' },
    })
    const location = toConsultedRequest(consultedRequestArrayResponseSchema.parse([locationDto])[0])
    const useCase = new GetConsultationRequestsUseCase({
      requests: { findByDocument: vi.fn().mockResolvedValue([certificate, location]) },
      texts: { list: vi.fn().mockResolvedValue([{ code: 'NOTICE', content: 'Texto' }]) },
    })

    const certificateResult = await useCase.execute('12345678', 'CERTIFICADO')
    expect(certificateResult.requests).toEqual([certificate])
    expect(matchesConsultationType(location, 'CERTIFICADO')).toBe(false)
  })

  it('keeps requests available when auxiliary texts fail', async () => {
    const certificate = toConsultedRequest(consultedRequestArrayResponseSchema.parse([requestResponse()])[0])
    const useCase = new GetConsultationRequestsUseCase({
      requests: { findByDocument: vi.fn().mockResolvedValue([certificate]) },
      texts: { list: vi.fn().mockRejectedValue(new Error('text provider failed')) },
    })

    await expect(useCase.execute('12345678', 'CERTIFICADO')).resolves.toMatchObject({
      requests: [certificate],
      texts: [],
      textStatus: 'unavailable',
    })
  })
})

describe('digital document contracts', () => {
  afterEach(() => vi.restoreAllMocks())

  const gateway = new ApiDigitalDocumentGateway()

  it('validates safe certificate and constancia URLs', () => {
    expect(certificateDigitalDocumentResponseSchema.safeParse(certificateDocument()).success).toBe(true)
    expect(constanciaDigitalDocumentResponseSchema.safeParse(constanciaDocument()).success).toBe(true)
    expect(certificateDigitalDocumentResponseSchema.safeParse({
      ...certificateDocument(),
      url: 'javascript:alert(1)',
    }).success).toBe(false)
  })

  it('normalizes historical numeric document numbers before mapping', () => {
    const certificate = certificateDigitalDocumentResponseSchema.parse({
      ...certificateDocument(),
      numeroDocumento: 12345678,
    })
    const constancia = constanciaDigitalDocumentResponseSchema.parse({
      ...constanciaDocument(),
      numeroDocumento: 12345678,
    })

    expect(certificate.numeroDocumento).toBe('12345678')
    expect(constancia.numeroDocumento).toBe('12345678')
  })

  it('normalizes the historical aliases returned by the constancia API', () => {
    const source = constanciaDocument()
    const parsed = constanciaDigitalDocumentResponseSchema.parse({
      ...source,
      solicitudId: undefined,
      numeroDocumento: undefined,
      fechaEmision: undefined,
      id_solicitud: String(source.solicitudId),
      dni: Number(source.numeroDocumento),
    })

    expect(parsed).toMatchObject({
      solicitudId: 1003,
      numeroDocumento: '12345678',
      tipo: 'ESTUDIOS',
      fechaEmision: null,
    })
  })

  it('distinguishes an absent document and maps both document kinds', async () => {
    const getOptional = vi.spyOn(resourceApiRepository, 'getOptional')
    getOptional.mockResolvedValueOnce(null)
    await expect(gateway.findByRequest({ kind: 'certificate', requestId: 1001 })).resolves.toBeNull()

    getOptional.mockResolvedValueOnce(certificateDocument())
    await expect(gateway.findByRequest({ kind: 'certificate', requestId: 1001 })).resolves.toMatchObject({
      kind: 'certificate', id: 'CERT-1', requestId: 1001, descriptor: 'INGLES', accepted: false,
    })

    getOptional.mockResolvedValueOnce([constanciaDocument()])
    await expect(gateway.findByRequest({ kind: 'constancia', requestId: 1003 })).resolves.toMatchObject({
      kind: 'constancia', id: 'CONST-1', requestId: 1003, descriptor: 'ESTUDIOS', accepted: true,
    })

    const { solicitudId, numeroDocumento, ...legacyConstancia } = constanciaDocument()
    getOptional.mockResolvedValueOnce({
      ...legacyConstancia,
      id_solicitud: solicitudId,
      dni: numeroDocumento,
    })
    await expect(gateway.findByRequest({ kind: 'constancia', requestId: 1003 })).resolves.toMatchObject({
      kind: 'constancia',
      id: 'CONST-1',
      requestId: 1003,
      documentNumber: '12345678',
    })
  })

  it('rejects malformed documents and sends a typed acceptance command', async () => {
    vi.spyOn(resourceApiRepository, 'getOptional').mockResolvedValueOnce({ id: 'CERT-1' })
    await expect(gateway.findByRequest({ kind: 'certificate', requestId: 1001 })).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE',
    })

    const update = vi.spyOn(resourceApiRepository, 'updateCommand').mockResolvedValueOnce(undefined)
    await gateway.accept({
      kind: 'certificate',
      documentId: 'CERT-1',
    })
    expect(update).toHaveBeenCalledWith('certificados/CERT-1', expect.objectContaining({ aceptado: true }))
  })

  it('rejects a document that does not belong to the requested operation', async () => {
    const port = digitalDocumentPort({
      findByRequest: vi.fn().mockResolvedValue({
        kind: 'certificate',
        id: 'CERT-1',
        requestId: 9999,
        documentNumber: '12345678',
        descriptor: 'INGLES',
        level: 'BASICO',
        url: 'https://files.example/certificate.pdf',
        accepted: false,
        issuedAt: null,
      }),
    })
    const useCase = new GetDigitalDocumentUseCase(port)

    await expect(useCase.execute({ kind: 'certificate', requestId: 1001 })).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE',
    })
  })

  it('validates queries and acceptance commands before calling infrastructure', async () => {
    const port = digitalDocumentPort()
    const getDocument = new GetDigitalDocumentUseCase(port)
    const acceptDocument = new AcceptDigitalDocumentUseCase(port)

    await expect(getDocument.execute({ kind: 'certificate', requestId: 0 })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
    await expect(acceptDocument.execute({ kind: 'constancia', documentId: '  ' })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
    expect(port.findByRequest).not.toHaveBeenCalled()
    expect(port.accept).not.toHaveBeenCalled()

    await acceptDocument.execute({ kind: 'constancia', documentId: ' CONST-1 ' })
    expect(port.accept).toHaveBeenCalledWith({ kind: 'constancia', documentId: 'CONST-1' })
  })
})

describe('consultation cargo presentation', () => {
  const texts = [
    { code: 'TEXTO_NOMBREAN', content: 'ANO ACADEMICO 2026' },
    { code: 'TEXTO_1_FINAL', content: 'Texto de entrega' },
    { code: 'TEXTO_1_DISCLAMER', content: 'Primera condicion' },
    { code: 'TEXTO_2_DISCLAMER', content: 'Segunda condicion' },
  ]

  it('builds independent certificate and constancia cargo variants', () => {
    const certificate = toConsultedRequest(consultedRequestArrayResponseSchema.parse([requestResponse()])[0])
    const constancia = toConsultedRequest(consultedRequestArrayResponseSchema.parse([
      requestResponse({
        id: 1003,
        tipoSolicitudId: 5,
        tiposSolicitud: { id: 5, solicitud: 'CONSTANCIA DE ESTUDIOS' },
      }),
    ])[0])

    const certificateCargo = toConsultationCargoDocument(certificate, texts)
    const constanciaCargo = toConsultationCargoDocument(constancia, texts)

    expect(certificateCargo.title).toBe('CARGO PARA LA ENTREGA DE CERTIFICADOS')
    expect(certificateCargo.fields[0]).toEqual({
      label: 'Tipo de documento',
      value: 'CERTIFICADO DE ESTUDIOS',
    })
    expect(constanciaCargo.title).toBe('CARGO PARA LA ENTREGA DE CONSTANCIAS')
    expect(constanciaCargo.fields[0]).toEqual({
      label: 'Tipo de constancia',
      value: 'CONSTANCIA DE ESTUDIOS',
    })
  })

  it('keeps the shared cargo renderer on explicit A4 dimensions', () => {
    expect(ADMINISTRATIVE_CARGO_PAGE_SIZE).toEqual([595.28, 841.89])
  })
})

function digitalDocumentPort(
  overrides: Partial<DigitalDocumentPort> = {},
): DigitalDocumentPort {
  return {
    findByRequest: vi.fn().mockResolvedValue(null),
    accept: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function requestResponse(override: Record<string, unknown> = {}) {
  return {
    id: 1001,
    tipoSolicitudId: 1,
    estadoId: 1,
    creadoEn: '2026-08-01T00:00:00.000Z',
    pago: 50,
    numeroVoucher: '123456789012345',
    fechaPago: '2026-08-01T00:00:00.000Z',
    digital: false,
    observaciones: null,
    estudiante: { id: 'student-1', nombres: 'Maria', apellidos: 'Perez', numeroDocumento: '12345678' },
    tiposSolicitud: { id: 1, solicitud: 'CERTIFICADO DE ESTUDIOS' },
    idioma: { id: 2, nombre: 'INGLES' },
    nivel: { id: 1, nombre: 'BASICO' },
    estado: { id: 1, nombre: 'NUEVO', referencia: 'REGISTRADO' },
    ...override,
  }
}

function certificateDocument() {
  return {
    _id: 'CERT-1',
    solicitudId: 1001,
    numeroDocumento: '12345678',
    idioma: 'INGLES',
    nivel: 'BASICO',
    url: 'https://files.example/certificate.pdf',
    aceptado: false,
    fechaEmision: '2026-08-01T00:00:00.000Z',
  }
}

function constanciaDocument() {
  return {
    id: 'CONST-1',
    solicitudId: 1003,
    numeroDocumento: '12345678',
    tipo: 'ESTUDIOS',
    url: 'https://files.example/constancia.pdf',
    aceptado: true,
    fechaEmision: '2026-08-01T00:00:00.000Z',
  }
}

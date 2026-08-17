import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { RegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/use-cases/register-solicitud-certificado.use-case'
import { FindCertificateStudentUseCase } from '@/modules/solicitud-certificado/application/use-cases/find-certificate-student.use-case'
import { GetCertificateCargoUseCase } from '@/modules/solicitud-certificado/application/use-cases/get-certificate-cargo.use-case'
import {
  CertificateCatalogs,
  SolicitudCertificado,
  hasConsistentCertificateCatalogs,
  isDigitalCertificateType,
} from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { SolicitudApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/solicitud-api.gateway'
import { CertificateStudentApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/certificate-student-api.gateway'
import { CertificateCargoApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/certificate-cargo-api.gateway'
import {
  toCertificateCargo,
  toCertificateRequestDto,
  toCertificateStudentRequestDto,
} from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import {
  certificateCargoResponseSchema,
  certificateCreateResponseSchema,
  certificateStudentLookupResponseSchema,
  certificateStudentResponseSchema,
  certificateTypeArraySchema,
} from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'
import {
  toCertificateBasicData,
  toCertificatePayment,
} from '@/modules/solicitud-certificado/presentation/certificate-form.mapper'
import useSolicitudCertificadoStore from '@/modules/solicitud-certificado/presentation/solicitud-certificado.store'
import { CertificateBasicDataFormValues } from '@/modules/solicitud-certificado/presentation/schemas/basic-data.schema'
import { solicitudCertificadoSchema } from '@/modules/solicitud-certificado/application/validation/solicitud-certificado.schema'

const catalogs: CertificateCatalogs = {
  requestTypes: [
    { id: 1, name: 'Certificado de estudios', price: 50 },
    { id: 2, name: 'Certificado de suficiencia', price: 60 },
    { id: 3, name: 'Certificado duplicado', price: 70 },
    { id: 4, name: 'Certificado digital', price: 45 },
  ],
  languages: [{ id: 2, name: 'Ingles' }],
  faculties: [{ id: 1, name: 'Ingenieria', code: 'FIIS' }],
  schools: [{ id: 2, name: 'Sistemas', facultyId: 1 }],
  texts: [{ code: 'TEXTO_NOMBREAN', content: 'Ano academico 2026' }],
}

describe('certificate domain and form mapping', () => {
  it.each([1, 2, 3, 4] as const)('accepts a complete request for certificate type %s', (typeId) => {
    expect(solicitudCertificadoSchema.safeParse(certificate({ typeId })).success).toBe(true)
  })

  it.each([
    ['DNI', '12345678'],
    ['CE', 'ABC123456'],
    ['PASAPORTE', 'P12345678'],
  ] as const)('accepts document type %s with its expected length', (documentType, documentNumber) => {
    expect(solicitudCertificadoSchema.safeParse(certificate({ documentType, documentNumber })).success).toBe(true)
  })

  it.each([
    { email: 'invalid' },
    { basicData: { typeId: 5 } },
    { basicData: { levelId: 4 } },
    { basicData: { documentNumber: '123' } },
    { payment: { amount: 50, voucher: null } },
    { payment: { amount: 50, voucher: { number: '123', paidAt: '2026-08-01', url: '' } } },
  ])('rejects incomplete or invalid domain combinations', (overrides) => {
    expect(solicitudCertificadoSchema.safeParse(mergeCertificateOverrides(overrides)).success).toBe(false)
  })

  it('accepts a zero payment without a voucher', () => {
    expect(solicitudCertificadoSchema.safeParse(certificate({ payment: { amount: 0, voucher: null } })).success).toBe(true)
  })

  it('requires complete academic data for an UNAC student', () => {
    const complete = certificate({
      basicData: {
        ...certificate().basicData,
        isUnacStudent: true,
        facultyId: 1,
        schoolId: 2,
        studentCode: '20260001',
      },
    })
    expect(solicitudCertificadoSchema.safeParse(complete).success).toBe(true)
    expect(solicitudCertificadoSchema.safeParse({
      ...complete,
      basicData: { ...complete.basicData, studentCode: '' },
    }).success).toBe(false)
  })

  it('detects schools that do not belong to a known faculty', () => {
    expect(hasConsistentCertificateCatalogs(catalogs)).toBe(true)
    expect(hasConsistentCertificateCatalogs({
      ...catalogs,
      schools: [{ id: 2, name: 'Sistemas', facultyId: 99 }],
    })).toBe(false)
  })

  it('validates selected catalogs and the school-faculty relation', () => {
    expect(toCertificateBasicData(basicForm(), catalogs)).toMatchObject({
      typeId: 1,
      languageId: 2,
      levelId: 1,
      isUnacStudent: false,
    })
    expect(() => toCertificateBasicData({ ...basicForm(), idioma: '99' }, catalogs)).toThrowError(AppError)
    expect(() => toCertificateBasicData({ ...basicForm(), nivel: '4' }, catalogs)).toThrowError(AppError)
    expect(() => toCertificateBasicData({
      ...basicForm(),
      estudiante: true,
      facultad: '1',
      escuela: '2',
      codigo: '20260001',
    }, { ...catalogs, schools: [{ id: 2, name: 'Sistemas', facultyId: 99 }] })).toThrowError(AppError)
  })

  it('requires the current normal price and complete voucher data', () => {
    expect(toCertificatePayment(paymentForm(), 50)).toEqual(certificate().payment)
    expect(() => toCertificatePayment({ ...paymentForm(), pago: '49.99' }, 50)).toThrowError(AppError)
    expect(() => toCertificatePayment({ ...paymentForm(), img_voucher: '' }, 50)).toThrowError(AppError)
    expect(toCertificatePayment({ pago: '0', numero_voucher: '', img_voucher: '' }, 0)).toEqual({
      amount: 0,
      voucher: null,
    })
  })
})

describe('certificate API contracts and mappers', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('maps the exact student and request DTOs', () => {
    const request = certificate()
    expect(toCertificateStudentRequestDto(request)).toEqual({
      nombres: 'MARIA',
      apellidos: 'PEREZ',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      celular: '999888777',
      email: 'user@example.com',
      facultadId: undefined,
      escuelaId: undefined,
      codigo: undefined,
    })
    expect(toCertificateRequestDto(request, 'student-1')).toMatchObject({
      estudianteId: 'student-1',
      tipoSolicitudId: 1,
      idiomaId: 2,
      nivelId: 1,
      estadoId: 1,
      alumnoCiunac: false,
      pago: 50,
      digital: false,
      numeroVoucher: '123456789012345',
      imgVoucher: '/voucher.png',
    })
  })

  it.each([
    [1, false],
    [2, true],
    [3, false],
    [4, true],
  ] as const)('derives digital=%s only from certificate type %s', (typeId, expected) => {
    expect(isDigitalCertificateType(typeId)).toBe(expected)
    expect(toCertificateRequestDto(certificate({ typeId }), 'student-1').digital).toBe(expected)
  })

  it('sends alumnoCiunac and academic data without a document field', () => {
    const request = certificate({
      basicData: {
        ...certificate().basicData,
        isUnacStudent: true,
        facultyId: 1,
        schoolId: 2,
        studentCode: '20260001',
      },
    })
    expect(toCertificateRequestDto(request, 'student-1').alumnoCiunac).toBe(true)
    expect(toCertificateStudentRequestDto(request)).toMatchObject({ facultadId: 1, escuelaId: 2, codigo: '20260001' })
    expect(toCertificateRequestDto(request, 'student-1')).not.toHaveProperty('imgCertEstudio')
  })

  it.each([null, {}, { id: 0 }, { id: '' }, { id: { value: 1 } }])(
    'rejects empty or malformed student and request responses',
    (response) => {
      expect(certificateStudentResponseSchema.safeParse(response).success).toBe(false)
      expect(certificateCreateResponseSchema.safeParse(response).success).toBe(false)
    },
  )

  it('normalizes valid identifiers and rejects incomplete lookup data', () => {
    expect(certificateStudentResponseSchema.parse({ id: 12 }).id).toBe('12')
    expect(certificateCreateResponseSchema.parse({ id: 'request-1' }).id).toBe('request-1')
    expect(certificateStudentLookupResponseSchema.safeParse({
      id: 'student-1', nombres: 'Maria', apellidos: '', celular: '999888777',
    }).success).toBe(false)
  })

  it('normalizes certificate prices and rejects empty or invalid catalogs', () => {
    expect(certificateTypeArraySchema.parse([
      { id: '1', solicitud: 'Certificado', precio: '50' },
    ])).toEqual([{ id: 1, solicitud: 'Certificado', precio: 50 }])
    expect(certificateTypeArraySchema.safeParse([]).success).toBe(false)
    expect(certificateTypeArraySchema.safeParse([
      { id: 5, solicitud: 'Constancia', precio: 30 },
    ]).success).toBe(false)
  })

  it('maps a complete cargo and rejects incomplete data', () => {
    const dto = certificateCargoResponseSchema.parse(cargoResponse())
    expect(toCertificateCargo(dto)).toEqual({
      id: 1001,
      typeName: 'Certificado de estudios',
      createdAt: '2026-08-01T12:00:00.000Z',
      student: { names: 'Maria', lastNames: 'Perez', documentNumber: '12345678' },
      languageName: 'Ingles',
      levelName: 'Basico',
      amount: 50,
      voucherNumber: '123456789012345',
      paidAt: '2026-08-01T00:00:00.000Z',
    })
    expect(certificateCargoResponseSchema.safeParse({ ...cargoResponse(), nivel: null }).success).toBe(false)
  })

  it('distinguishes an absent cargo from malformed data and network errors', async () => {
    const getOptional = vi.spyOn(resourceApiRepository, 'getOptional')
    getOptional.mockResolvedValueOnce(null)
    const gateway = new CertificateCargoApiGateway()
    await expect(gateway.findById(1001)).resolves.toBeNull()
    getOptional.mockResolvedValueOnce({ id: 1001 })
    await expect(gateway.findById(1001)).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    const networkError = new AppError({ code: 'NETWORK', message: 'Sin conexion', retryable: true })
    getOptional.mockRejectedValueOnce(networkError)
    await expect(gateway.findById(1001)).rejects.toBe(networkError)
  })

  it('updates an existing student and rejects a malformed response', async () => {
    const update = vi.spyOn(resourceApiRepository, 'update').mockResolvedValueOnce({ id: 'student-1' })
    const request = certificate({
      basicData: { ...certificate().basicData, existingStudentId: 'student-1' },
    })
    await expect(new CertificateStudentApiGateway().save(request)).resolves.toBe('student-1')
    expect(update).toHaveBeenCalledWith('estudiantes/student-1', expect.any(Object))

    update.mockResolvedValueOnce({})
    await expect(new CertificateStudentApiGateway().save(request)).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
  })

  it('preserves a 409 validation error returned by price verification', async () => {
    const priceError = new AppError({ code: 'VALIDATION', status: 409, message: 'El tarifario cambio.' })
    vi.spyOn(resourceApiRepository, 'create').mockRejectedValueOnce(priceError)
    await expect(new SolicitudApiGateway().create(certificate(), 'student-1')).rejects.toBe(priceError)
  })
})

describe('certificate read use cases', () => {
  it('normalizes a valid document and rejects invalid input before integration', async () => {
    const findByDocument = vi.fn().mockResolvedValue(null)
    const useCase = new FindCertificateStudentUseCase({ findByDocument })

    await expect(useCase.execute(' ab123456 ')).resolves.toBeNull()
    expect(findByDocument).toHaveBeenCalledWith('AB123456')

    await expect(useCase.execute('123')).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(findByDocument).toHaveBeenCalledTimes(1)
  })

  it('rejects an invalid cargo id before integration and preserves absence', async () => {
    const findById = vi.fn().mockResolvedValue(null)
    const useCase = new GetCertificateCargoUseCase({ findById })

    await expect(useCase.execute(1001)).resolves.toBeNull()
    await expect(useCase.execute(0)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(findById).toHaveBeenCalledTimes(1)
  })
})

describe('certificate workflow store', () => {
  beforeEach(() => useSolicitudCertificadoStore.getState().reset())

  it('uses typed commands and prevents payment before basic data', () => {
    const store = useSolicitudCertificadoStore.getState()
    expect(store.workflow.status).toBe('initial')
    expect('setSolicitudField' in store).toBe(false)
    store.initialize('user@example.com')
    store.completePayment(certificate().payment)
    expect(useSolicitudCertificadoStore.getState().workflow.draft.payment).toBeNull()
  })

  it('keeps payment only while document and certificate type remain unchanged', () => {
    const request = certificate()
    const store = useSolicitudCertificadoStore.getState()
    store.initialize(request.email)
    store.completeBasicData(request.basicData)
    store.completePayment(request.payment)
    store.completeBasicData({ ...request.basicData, names: 'Ana' })
    expect(useSolicitudCertificadoStore.getState().workflow.draft.payment).not.toBeNull()
    useSolicitudCertificadoStore.getState().completeBasicData({ ...request.basicData, documentNumber: '87654321' })
    expect(useSolicitudCertificadoStore.getState().workflow.draft.payment).toBeNull()
    store.completePayment(request.payment)
    store.completeBasicData({ ...request.basicData, typeId: 2 })
    expect(useSolicitudCertificadoStore.getState().workflow.draft.payment).toBeNull()
  })

  it('represents registration, success, error and notification retry explicitly', () => {
    const request = certificate()
    const error = new AppError({ code: 'EXTERNAL_SERVICE', message: 'Proveedor no disponible' })
    const store = useSolicitudCertificadoStore.getState()
    store.initialize(request.email)
    store.beginRegistration(request)
    expect(useSolicitudCertificadoStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'registration' })
    store.markRegistrationFailed(error)
    expect(useSolicitudCertificadoStore.getState().workflow).toMatchObject({ status: 'error', error })
    store.markNotificationFailed('request-1', error)
    expect(useSolicitudCertificadoStore.getState().workflow.status).toBe('saved_notification_failed')
    store.beginNotificationRetry('request-1')
    expect(useSolicitudCertificadoStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'notification' })
    store.completeRegistration('request-1', 'receipt-1')
    expect(useSolicitudCertificadoStore.getState().workflow).toMatchObject({
      status: 'success', requestId: 'request-1', receiptId: 'receipt-1',
    })
  })
})

describe('certificate registration use case', () => {
  it('returns partial success and retries only the notification', async () => {
    const save = vi.fn().mockResolvedValue('student-1')
    const create = vi.fn().mockResolvedValue('request-1')
    const sendSolicitudCreada = vi.fn()
      .mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo no disponible' }))
      .mockResolvedValueOnce('receipt-1')
    const useCase = new RegisterSolicitudCertificadoUseCase({
      studentGateway: { save },
      solicitudGateway: { create },
      notificationGateway: { sendSolicitudCreada },
    })

    await expect(useCase.execute({ solicitud: certificate() })).resolves.toMatchObject({
      status: 'saved_notification_failed', requestId: 'request-1',
    })
    await expect(useCase.retryNotification('request-1')).resolves.toBe('receipt-1')
    expect(save).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
    expect(sendSolicitudCreada).toHaveBeenCalledTimes(2)
  })

  it('does not call integrations for invalid input or notify without a request id', async () => {
    const save = vi.fn()
    const create = vi.fn()
    const notify = vi.fn()
    const useCase = new RegisterSolicitudCertificadoUseCase({
      studentGateway: { save },
      solicitudGateway: { create },
      notificationGateway: { sendSolicitudCreada: notify },
    })
    await expect(useCase.execute({
      solicitud: { ...certificate(), email: 'invalid' },
    })).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(save).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()

    save.mockResolvedValueOnce('student-1')
    create.mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Sin identificador' }))
    await expect(useCase.execute({ solicitud: certificate() })).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(notify).not.toHaveBeenCalled()
  })
})

type CertificateOverrides = {
  typeId?: 1 | 2 | 3 | 4
  documentType?: 'DNI' | 'CE' | 'PASAPORTE'
  documentNumber?: string
  basicData?: SolicitudCertificado['basicData']
  payment?: SolicitudCertificado['payment']
}

function certificate(overrides: CertificateOverrides = {}): SolicitudCertificado {
  return {
    email: 'user@example.com',
    basicData: overrides.basicData ?? {
      typeId: overrides.typeId ?? 1,
      languageId: 2,
      levelId: 1,
      names: 'Maria',
      lastNames: 'Perez',
      documentType: overrides.documentType ?? 'DNI',
      documentNumber: overrides.documentNumber ?? '12345678',
      phone: '999888777',
      existingStudentId: null,
      isUnacStudent: false,
    },
    payment: overrides.payment ?? {
      amount: 50,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/voucher.png',
      },
    },
  }
}

function basicForm(): CertificateBasicDataFormValues {
  return {
    tipo_solicitud: '1', idioma: '2', nivel: '1', apellidos: 'Perez', nombres: 'Maria',
    facultad: '', estudiante: false, escuela: '', codigo: '', tipo_documento: 'DNI',
    dni: '12345678', celular: '999888777', estudianteId: '',
  }
}

function paymentForm() {
  return {
    pago: '50',
    numero_voucher: '123456789012345',
    fecha_pago: new Date('2026-08-01T00:00:00.000Z'),
    img_voucher: '/voucher.png',
  }
}

function mergeCertificateOverrides(overrides: Record<string, unknown>): unknown {
  const request = certificate()
  return {
    ...request,
    ...overrides,
    basicData: { ...request.basicData, ...asRecord(overrides.basicData) },
    payment: overrides.payment ?? request.payment,
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function cargoResponse() {
  return {
    id: 1001,
    creadoEn: '2026-08-01T12:00:00.000Z',
    pago: '50',
    numeroVoucher: '123456789012345',
    fechaPago: '2026-08-01T00:00:00.000Z',
    estudiante: { nombres: 'Maria', apellidos: 'Perez', numeroDocumento: '12345678' },
    tiposSolicitud: { id: 1, solicitud: 'Certificado de estudios' },
    idioma: { nombre: 'Ingles' },
    nivel: { nombre: 'Basico' },
  }
}

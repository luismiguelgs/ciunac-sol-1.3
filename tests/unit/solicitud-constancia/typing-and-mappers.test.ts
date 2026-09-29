import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import * as api from '@/lib/api.service'
import { findConstanciaStudent, getConstanciaCargo, registerConstancia } from '@/modules/solicitud-constancia/operations'
import {
  ConstanciaCatalogs,
  SolicitudConstancia,
  hasConsistentConstanciaCatalogs,
} from '@/modules/solicitud-constancia/model'
import { fetchConstanciaCargo, fetchConstanciaStudent, saveConstanciaStudent, sendConstanciaNotification } from '@/modules/solicitud-constancia/infrastructure/constancia-client'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import {
  toConstanciaCargo,
  toConstanciaRequestDto,
  toConstanciaStudentRequestDto,
} from '@/modules/solicitud-constancia/infrastructure/constancia-api.mapper'
import {
  constanciaCargoResponseSchema,
  constanciaCreateResponseSchema,
  constanciaStudentLookupResponseSchema,
  constanciaStudentResponseSchema,
  constanciaTypeArraySchema,
} from '@/modules/solicitud-constancia/infrastructure/constancia-api.schemas'
import useSolicitudConstanciaStore from '@/modules/solicitud-constancia/store'
import { solicitudConstanciaSchema } from '@/modules/solicitud-constancia/schemas'
import {
  toConstanciaBasicData,
  toConstanciaPayment,
  toCompleteConstanciaRequest,
} from '@/modules/solicitud-constancia/components/constancia-form.mapper'
import type { ConstanciaBasicDataFormValues } from '@/modules/solicitud-constancia/components/basic-data.schema'

const catalogs: ConstanciaCatalogs = {
  requestTypes: [
    { id: 5, name: 'Constancia de estudios', price: 30 },
    { id: 6, name: 'Constancia de notas', price: 35 },
  ],
  languages: [{ id: 2, name: 'Ingles' }],
  faculties: [{ id: 1, name: 'Ingenieria', code: 'FIIS' }],
  schools: [{ id: 2, name: 'Sistemas', facultyId: 1 }],
  texts: [{ code: 'TEXTO_NOMBREAN', content: 'Ano academico 2026' }],
}

describe('solicitud constancia domain', () => {
  it.each([5, 6] as const)('accepts a complete request for type %s', (typeId) => {
    expect(solicitudConstanciaSchema.safeParse(constancia({ typeId })).success).toBe(true)
  })

  it('accepts zero payment without a voucher', () => {
    const request = constancia({ payment: { amount: 0, voucher: null } })
    expect(solicitudConstanciaSchema.safeParse(request).success).toBe(true)
  })

  it.each([
    ['invalid type', { basicData: { typeId: 1 } }],
    ['invalid language', { basicData: { languageId: 0 } }],
    ['invalid level', { basicData: { levelId: 4 } }],
    ['missing payment URL', { payment: { amount: 30, voucher: { number: '123456789012345', paidAt: '2026-08-01T00:00:00.000Z' } } }],
    ['invalid voucher number', { payment: { amount: 30, voucher: { number: '123', paidAt: '2026-08-01T00:00:00.000Z', url: '/voucher.png' } } }],
  ])('rejects %s', (_label, overrides) => {
    const request = mergeConstanciaOverrides(overrides)
    expect(solicitudConstanciaSchema.safeParse(request).success).toBe(false)
  })

  it('requires faculty, school and code for an UNAC student', () => {
    const request = {
      ...constancia(),
      basicData: { ...constancia().basicData, isUnacStudent: true },
    }
    expect(solicitudConstanciaSchema.safeParse(request).success).toBe(false)
  })

  it('validates catalogs, academic relations and the current price', () => {
    expect(hasConsistentConstanciaCatalogs(catalogs)).toBe(true)
    expect(hasConsistentConstanciaCatalogs({
      ...catalogs,
      schools: [{ id: 2, name: 'Sistemas', facultyId: 99 }],
    })).toBe(false)
    expect(toConstanciaBasicData(basicForm(), catalogs)).toMatchObject({ typeId: 5, languageId: 2, levelId: 1 })
    expect(() => toConstanciaBasicData({ ...basicForm(), idioma: '99' }, catalogs)).toThrowError(AppError)
    expect(() => toConstanciaBasicData({
      ...basicForm(), estudiante: true, facultad: '1', escuela: '2', codigo: '20260001',
    }, { ...catalogs, schools: [{ id: 2, name: 'Sistemas', facultyId: 99 }] })).toThrowError(AppError)

    expect(toConstanciaPayment(paymentForm(), 30)).toEqual(constancia().payment)
    expect(() => toConstanciaPayment({ ...paymentForm(), pago: '29.99' }, 30)).toThrowError(AppError)
    expect(() => toConstanciaPayment({ ...paymentForm(), img_voucher: '' }, 30)).toThrowError(AppError)
  })
})

describe('solicitud constancia API contracts', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps the student and request to the current backend contract', () => {
    const request = constancia()

    expect(toConstanciaStudentRequestDto(request)).toEqual({
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
    expect(toConstanciaRequestDto(request, 'student-1')).toMatchObject({
      estudianteId: 'student-1',
      tipoSolicitudId: 5,
      idiomaId: 2,
      nivelId: 1,
      estadoId: 1,
      alumnoCiunac: false,
      fechaPago: '2026-08-01T00:00:00.000Z',
      pago: 30,
      digital: true,
      numeroVoucher: '123456789012345',
      imgVoucher: '/voucher.png',
    })
    expect(toConstanciaRequestDto(request, 'student-1').periodo).toMatch(/^\d{6}$/)
  })

  it.each([
    ['empty', null],
    ['missing id', {}],
    ['zero id', { id: 0 }],
    ['invalid id shape', { id: { value: 1 } }],
  ])('rejects a %s create response', (_label, response) => {
    expect(constanciaCreateResponseSchema.safeParse(response).success).toBe(false)
    expect(constanciaStudentResponseSchema.safeParse(response).success).toBe(false)
  })

  it('normalizes valid string and numeric identifiers', () => {
    expect(constanciaCreateResponseSchema.parse({ id: 42 }).id).toBe('42')
    expect(constanciaStudentResponseSchema.parse({ id: 'student-1' }).id).toBe('student-1')
  })

  it('rejects an incomplete student lookup', () => {
    expect(constanciaStudentLookupResponseSchema.safeParse({
      id: 'student-1',
      nombres: '',
      apellidos: 'Perez',
      celular: '999888777',
    }).success).toBe(false)
  })

  it('normalizes the request type catalog and rejects invalid prices', () => {
    expect(constanciaTypeArraySchema.parse([
      { id: '5', solicitud: 'Constancia de estudios', precio: '30' },
    ])).toEqual([{ id: 5, solicitud: 'Constancia de estudios', precio: 30 }])
    expect(constanciaTypeArraySchema.safeParse([
      { id: 5, solicitud: 'Constancia de estudios', precio: 'no-numerico' },
    ]).success).toBe(false)
    expect(constanciaTypeArraySchema.safeParse([]).success).toBe(false)
    expect(constanciaTypeArraySchema.safeParse([
      { id: 1, solicitud: 'Certificado', precio: 50 },
    ]).success).toBe(false)
  })

  it('maps a complete cargo and rejects an incomplete one', () => {
    const dto = constanciaCargoResponseSchema.parse(cargoResponse())
    expect(toConstanciaCargo(dto)).toEqual({
      id: 81,
      typeName: 'Constancia de estudios',
      createdAt: '2026-08-01T12:00:00.000Z',
      student: { names: 'Maria', lastNames: 'Perez', documentNumber: '12345678' },
      languageName: 'Ingles',
      levelName: 'Basico 1',
      amount: 30,
      voucherNumber: '123456789012345',
      paidAt: '2026-08-01T00:00:00.000Z',
    })

    const incomplete = { ...cargoResponse(), idioma: null }
    expect(constanciaCargoResponseSchema.safeParse(incomplete).success).toBe(false)
  })

  it('distinguishes an absent cargo from malformed data and network errors', async () => {
    const getOptional = vi.spyOn(api, 'apiFetchOptional')
    getOptional.mockResolvedValueOnce(null)
    await expect(fetchConstanciaCargo(81)).resolves.toBeNull()

    getOptional.mockResolvedValueOnce({ id: 81 })
    await expect(fetchConstanciaCargo(81)).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE',
    })

    const networkError = new AppError({ code: 'NETWORK', message: 'Sin conexion', retryable: true })
    getOptional.mockRejectedValueOnce(networkError)
    await expect(fetchConstanciaCargo(81)).rejects.toBe(networkError)
  })

  it('updates an existing student and distinguishes absence in lookup', async () => {
    const update = vi.spyOn(api, 'apiFetch').mockResolvedValueOnce({ id: 'student-1' })
    const request = constancia({
      basicData: { ...constancia().basicData, existingStudentId: 'student-1' },
    })
    await expect(saveConstanciaStudent(request)).resolves.toBe('student-1')
    expect(update).toHaveBeenCalledWith('estudiantes/student-1', 'PATCH', expect.any(Object))

    vi.spyOn(api, 'apiFetchOptional').mockResolvedValueOnce(null)
    await expect(fetchConstanciaStudent('12345678')).resolves.toBeNull()
  })
})

describe('solicitud constancia read use cases', () => {
  it('normalizes documents and rejects invalid input before integration', async () => {
    const findByDocument = vi.fn().mockResolvedValue(null)
    await expect(findConstanciaStudent(' ab123456 ', findByDocument)).resolves.toBeNull()
    expect(findByDocument).toHaveBeenCalledWith('AB123456')
    await expect(findConstanciaStudent('123', findByDocument)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(findByDocument).toHaveBeenCalledTimes(1)
  })

  it('validates the cargo identifier and preserves absence', async () => {
    const findById = vi.fn().mockResolvedValue(null)
    await expect(getConstanciaCargo(81, findById)).resolves.toBeNull()
    await expect(getConstanciaCargo(0, findById)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(findById).toHaveBeenCalledTimes(1)
  })
})

describe('constancia pragmatic operations', () => {
  afterEach(() => vi.restoreAllMocks())

  it('builds only complete drafts, including zero payment, without casting', () => {
    const request = constancia()
    expect(toCompleteConstanciaRequest(request)).toEqual(request)
    expect(toCompleteConstanciaRequest({ ...request, email: '' })).toBeNull()
    expect(toCompleteConstanciaRequest({ ...request, basicData: null })).toBeNull()
    expect(toCompleteConstanciaRequest({ ...request, payment: null })).toBeNull()
    const free = constancia({ payment: { amount: 0, voucher: null } })
    expect(toCompleteConstanciaRequest(free)).toEqual(free)
  })

  it('registers in order and returns the persisted reference and receipt', async () => {
    const calls: string[] = []
    const request = constancia()
    const outcome = await registerConstancia(request, {
      saveStudent: async (data) => {
        expect(data).toEqual(request)
        calls.push('student')
        return 'student-1'
      },
      createRequest: async (data, studentId) => {
        expect(data).toEqual(request)
        expect(studentId).toBe('student-1')
        calls.push('request')
        return 'request-1'
      },
      sendNotification: async (requestId) => {
        expect(requestId).toBe('request-1')
        calls.push('notification')
        return 'receipt-1'
      },
    })
    expect(calls).toEqual(['student', 'request', 'notification'])
    expect(outcome).toEqual({ status: 'completed', requestId: 'request-1', notificationReceiptId: 'receipt-1' })
  })

  it('stops after a failed student write without changing the error', async () => {
    const error = new AppError({ code: 'NETWORK', message: 'Sin conexion', retryable: true })
    const createRequest = vi.fn()
    const sendNotification = vi.fn()
    await expect(registerConstancia(constancia(), {
      saveStudent: vi.fn().mockRejectedValue(error), createRequest, sendNotification,
    })).rejects.toBe(error)
    expect(createRequest).not.toHaveBeenCalled()
    expect(sendNotification).not.toHaveBeenCalled()
  })

  it.each(['VALIDATION', 'AUTHENTICATION', 'AUTHORIZATION', 'NETWORK', 'EXTERNAL_SERVICE'] as const)(
    'preserves %s notification metadata through infrastructure and the partial outcome', async (code) => {
      const error = new AppError({ code, status: 403, message: 'Mensaje seguro', correlationId: 'constancia-test', retryable: false })
      const send = vi.spyOn(mailApiRepository, 'send').mockRejectedValue(error)
      const result = await registerConstancia(constancia(), {
        saveStudent: vi.fn().mockResolvedValue('student-1'),
        createRequest: vi.fn().mockResolvedValue('request-1'),
        sendNotification: sendConstanciaNotification,
      })
      expect(result.status).toBe('saved_notification_failed')
      if (result.status !== 'saved_notification_failed') throw new Error('Expected partial success')
      expect(result.requestId).toBe('request-1')
      expect(result.error).toBe(error)
      expect(result.error).toMatchObject({ code, status: 403, correlationId: 'constancia-test', retryable: false })
      expect(send).toHaveBeenCalledExactlyOnceWith({ type: 'CONSTANCIA', reference: 'request-1' })
    },
  )

  it('normalizes an unexpected mail failure without exposing provider details', async () => {
    vi.spyOn(mailApiRepository, 'send').mockRejectedValue(new Error('internal provider detail'))
    await expect(sendConstanciaNotification('request-1')).rejects.toMatchObject({
      code: 'UNEXPECTED', message: 'La solicitud se guardo, pero el correo no pudo procesarse.',
    })
  })

  it('distinguishes student data, absence and malformed responses', async () => {
    const get = vi.spyOn(api, 'apiFetchOptional')
    get.mockResolvedValueOnce({ id: 10, nombres: 'Maria', apellidos: 'Perez', celular: '999888777' })
    await expect(fetchConstanciaStudent('12345678')).resolves.toEqual({
      id: '10', names: 'Maria', lastNames: 'Perez', phone: '999888777',
    })
    get.mockResolvedValueOnce(null)
    await expect(fetchConstanciaStudent('12345678')).resolves.toBeNull()
    get.mockResolvedValueOnce({ id: 10 })
    await expect(fetchConstanciaStudent('12345678')).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
  })
})

describe('solicitud constancia workflow store', () => {
  beforeEach(() => useSolicitudConstanciaStore.getState().reset())

  it('moves from initial to editing and prevents payment before basic data', () => {
    expect(useSolicitudConstanciaStore.getState().workflow.status).toBe('initial')
    expect('updateDraft' in useSolicitudConstanciaStore.getState()).toBe(false)

    useSolicitudConstanciaStore.getState().initialize('user@example.com')
    useSolicitudConstanciaStore.getState().completePayment(constancia().payment)

    const workflow = useSolicitudConstanciaStore.getState().workflow
    expect(workflow.status).toBe('editing')
    expect(workflow.draft.payment).toBeNull()
  })

  it('keeps payment only while document and constancia type remain unchanged', () => {
    const request = constancia()
    const store = useSolicitudConstanciaStore.getState()
    store.initialize(request.email)
    store.completeBasicData(request.basicData)
    store.completePayment(request.payment)
    store.completeBasicData({ ...request.basicData, levelId: 2 })
    expect(useSolicitudConstanciaStore.getState().workflow.draft.payment).toEqual(request.payment)
    useSolicitudConstanciaStore.getState().completeBasicData({ ...request.basicData, documentNumber: '87654321' })
    expect(useSolicitudConstanciaStore.getState().workflow.draft.payment).toBeNull()
    store.completePayment(request.payment)
    store.completeBasicData({ ...request.basicData, typeId: 6 })
    expect(useSolicitudConstanciaStore.getState().workflow.draft.payment).toBeNull()

    store.completeBasicData(request.basicData)
    store.completePayment(request.payment)
    useSolicitudConstanciaStore.getState().beginRegistration(request)
    expect(useSolicitudConstanciaStore.getState().workflow).toMatchObject({
      status: 'submitting',
      operation: 'registration',
    })

    useSolicitudConstanciaStore.getState().completeRegistration('request-1', 'receipt-1')
    expect(useSolicitudConstanciaStore.getState().workflow).toMatchObject({
      status: 'success',
      requestId: 'request-1',
      receiptId: 'receipt-1',
    })
  })

  it('represents registration error and notification retry separately', () => {
    const error = new AppError({ code: 'EXTERNAL_SERVICE', message: 'Proveedor no disponible' })
    const request = constancia()
    const store = useSolicitudConstanciaStore.getState()
    store.initialize(request.email)
    store.beginRegistration(request)
    store.markRegistrationFailed(error)
    expect(useSolicitudConstanciaStore.getState().workflow).toMatchObject({ status: 'error', error })

    useSolicitudConstanciaStore.getState().beginRegistration(request)
    useSolicitudConstanciaStore.getState().markNotificationFailed('request-1', error)
    expect(useSolicitudConstanciaStore.getState().workflow).toMatchObject({
      status: 'saved_notification_failed',
      requestId: 'request-1',
    })

    useSolicitudConstanciaStore.getState().beginNotificationRetry('request-1')
    expect(useSolicitudConstanciaStore.getState().workflow).toMatchObject({
      status: 'submitting',
      operation: 'notification',
      requestId: 'request-1',
    })
  })
})

type ConstanciaOverrides = {
  typeId?: 5 | 6
  basicData?: SolicitudConstancia['basicData']
  payment?: SolicitudConstancia['payment']
}

function constancia(overrides: ConstanciaOverrides = {}): SolicitudConstancia {
  return {
    email: 'user@example.com',
    basicData: overrides.basicData ?? {
      typeId: overrides.typeId ?? 5,
      languageId: 2,
      levelId: 1,
      names: 'Maria',
      lastNames: 'Perez',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '999888777',
      existingStudentId: null,
      isUnacStudent: false,
    },
    payment: overrides.payment ?? {
      amount: 30,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/voucher.png',
      },
    },
  }
}

function basicForm(): ConstanciaBasicDataFormValues {
  return {
    tipo_solicitud: '5', apellidos: 'Perez', nombres: 'Maria', idioma: '2', nivel: '1',
    tipo_documento: 'DNI', celular: '999888777', dni: '12345678', estudianteId: '',
    estudiante: false, facultad: '', escuela: '', codigo: '',
  }
}

function paymentForm() {
  return {
    pago: '30',
    numero_voucher: '123456789012345',
    fecha_pago: new Date('2026-08-01T00:00:00.000Z'),
    img_voucher: '/voucher.png',
  }
}

function mergeConstanciaOverrides(overrides: Record<string, unknown>): unknown {
  const request = constancia()
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
    id: 81,
    creadoEn: '2026-08-01T12:00:00.000Z',
    pago: '30',
    numeroVoucher: '123456789012345',
    fechaPago: '2026-08-01T00:00:00.000Z',
    estudiante: { nombres: 'Maria', apellidos: 'Perez', numeroDocumento: '12345678' },
    tiposSolicitud: { id: 5, solicitud: 'Constancia de estudios' },
    idioma: { nombre: 'Ingles' },
    nivel: { nombre: 'Basico 1' },
  }
}

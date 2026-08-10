import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { constanciaCargoRepository } from '@/modules/solicitud-constancia/infrastructure/constancia-cargo.repository'
import {
  toConstanciaCargo,
  toConstanciaRequestDto,
  toConstanciaStudentRequestDto,
} from '@/modules/solicitud-constancia/infrastructure/mappers/constancia-api.mapper'
import {
  constanciaCargoResponseSchema,
  constanciaCreateResponseSchema,
  constanciaStudentLookupResponseSchema,
  constanciaStudentResponseSchema,
  constanciaTypeCatalogResponseSchema,
} from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'
import useSolicitudConstanciaStore from '@/modules/solicitud-constancia/presentation/solicitud-constancia.store'
import { solicitudConstanciaSchema } from '@/modules/solicitud-constancia/schemas/solicitud-constancia.schema'

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
    expect(constanciaTypeCatalogResponseSchema.parse([
      { id: '5', solicitud: 'Constancia de estudios', precio: '30' },
    ])).toEqual([{ id: 5, solicitud: 'Constancia de estudios', precio: 30 }])
    expect(constanciaTypeCatalogResponseSchema.safeParse([
      { id: 5, solicitud: 'Constancia de estudios', precio: 'no-numerico' },
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
    const getOptional = vi.spyOn(resourceApiRepository, 'getOptional')
    getOptional.mockResolvedValueOnce(null)
    await expect(constanciaCargoRepository.findById(81)).resolves.toBeNull()

    getOptional.mockResolvedValueOnce({ id: 81 })
    await expect(constanciaCargoRepository.findById(81)).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE',
    })

    const networkError = new AppError({ code: 'NETWORK', message: 'Sin conexion', retryable: true })
    getOptional.mockRejectedValueOnce(networkError)
    await expect(constanciaCargoRepository.findById(81)).rejects.toBe(networkError)
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

  it('invalidates payment when basic data changes and reaches success', () => {
    const request = constancia()
    const store = useSolicitudConstanciaStore.getState()
    store.initialize(request.email)
    store.completeBasicData(request.basicData)
    store.completePayment(request.payment)
    store.completeBasicData({ ...request.basicData, levelId: 2 })
    expect(useSolicitudConstanciaStore.getState().workflow.draft.payment).toBeNull()

    useSolicitudConstanciaStore.getState().completePayment(request.payment)
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
  payment?: SolicitudConstancia['payment']
}

function constancia(overrides: ConstanciaOverrides = {}): SolicitudConstancia {
  return {
    email: 'user@example.com',
    basicData: {
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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import * as api from '@/lib/api.service'
import { findLocationStudent, getLocationCargo, registerLocation, checkDuplicateLocation } from '@/modules/solicitud-ubicacion/operations'
import { retrySolicitudUbicacionNotification } from '@/modules/solicitud-ubicacion/client'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { solicitudUbicacionDomainSchema } from '@/modules/solicitud-ubicacion/schemas'
import {
  getIdentityDocumentViolation,
  getStudyCertificateViolation,
} from '@/modules/solicitud-ubicacion/domain/location-document-policy'
import {
  LocationCatalogs,
  SolicitudUbicacion,
  isOfficialLocationPrice,
} from '@/modules/solicitud-ubicacion/model'
import { findCargoById, saveLocationStudent, createLocationRequest, saveLocationProfile, sendLocationNotification } from '@/modules/solicitud-ubicacion/infrastructure/location-client'
import { locationBasicDataFormSchema } from '@/modules/solicitud-ubicacion/components/location-basic-data.schema'
import {
  toLocationCargo,
  toLocationRequestDto,
  toLocationStudentRequestDto,
} from '@/modules/solicitud-ubicacion/infrastructure/location-api.mapper'
import {
  locationCargoResponseSchema,
  locationCreateResponseSchema,
  locationDuplicateResponseArraySchema,
  locationRequestDtoSchema,
  locationStudentResponseSchema,
  locationStudentRequestDtoSchema,
  locationTypeArraySchema,
} from '@/modules/solicitud-ubicacion/infrastructure/location-api.schemas'
import {
  validateIdentityDocumentUpload,
  validateLocationStudyCertificateUpload,
} from '@/modules/solicitud-ubicacion/infrastructure/server/location-document-upload'
import {
  toLocationBasicData,
  toLocationPayment,
  toCompleteLocationRequest,
} from '@/modules/solicitud-ubicacion/components/location-form.mapper'
import useSolicitudUbicacionStore from '@/modules/solicitud-ubicacion/store'

const catalogs: LocationCatalogs = {
  requestType: { id: 7, name: 'Examen de ubicacion', price: 30 },
  languages: [{ id: 2, name: 'Ingles' }],
  texts: [{ code: 'TEXTO_NOMBREAN', content: 'Ano academico 2026' }],
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('location domain, forms and price', () => {
  it('accepts complete CIUNAC and non-CIUNAC requests', () => {
    expect(solicitudUbicacionDomainSchema.safeParse(locationRequest()).success).toBe(true)
    expect(solicitudUbicacionDomainSchema.safeParse(locationRequest({ ciunac: true })).success).toBe(true)
  })

  it('enforces CIUNAC document and level combinations', () => {
    const ciunac = locationRequest({ ciunac: true })
    expect(solicitudUbicacionDomainSchema.safeParse({ ...ciunac, studyCertificateUrl: null }).success).toBe(false)
    const external = locationRequest()
    expect(solicitudUbicacionDomainSchema.safeParse({
      ...external,
      basicData: { ...external.basicData, levelId: 2 },
    }).success).toBe(false)
    expect(solicitudUbicacionDomainSchema.safeParse({ ...external, studyCertificateUrl: '/study.pdf' }).success).toBe(false)
  })

  it.each([
    ['DNI', '12345678'],
    ['CE', 'ABC123456'],
    ['PASAPORTE', 'P12345678'],
  ] as const)('accepts %s with its required length', (documentType, documentNumber) => {
    const request = locationRequest()
    expect(solicitudUbicacionDomainSchema.safeParse({
      ...request,
      basicData: { ...request.basicData, documentType, documentNumber },
    }).success).toBe(true)
  })

  it('maps catalogs and rejects invalid language or level selections', () => {
    expect(toLocationBasicData(basicForm(), catalogs, false)).toMatchObject({ languageId: 2, levelId: 1 })
    expect(() => toLocationBasicData({ ...basicForm(), idioma: '99' }, catalogs, false)).toThrowError(AppError)
    expect(() => toLocationBasicData({ ...basicForm(), nivel: '2' }, catalogs, false)).toThrowError(AppError)
    expect(toLocationBasicData({ ...basicForm(), nivel: '2' }, catalogs, true).levelId).toBe(2)
  })

  it('accepts only the official S/30 payment with a complete voucher', () => {
    expect(isOfficialLocationPrice(30)).toBe(true)
    expect(isOfficialLocationPrice(80)).toBe(false)
    expect(toLocationPayment(paymentForm()).amount).toBe(30)
    expect(() => toLocationPayment({ ...paymentForm(), pago: '80' })).toThrowError(AppError)
    expect(() => toLocationPayment({ ...paymentForm(), img_voucher: '' })).toThrowError(AppError)
  })
})

describe('location DTOs, external responses and gateways', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('maps the exact student and request DTOs', () => {
    const request = locationRequest({ ciunac: true })
    expect(toLocationStudentRequestDto(request)).toEqual({
      nombres: 'MARIA',
      apellidos: 'PEREZ',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      celular: '999888777',
      email: 'user@example.com',
      imgDoc: '/identity.pdf',
    })
    expect(toLocationRequestDto(request, 'student-1')).toMatchObject({
      estudianteId: 'student-1',
      tipoSolicitudId: 7,
      idiomaId: 2,
      nivelId: 2,
      alumnoCiunac: true,
      pago: 30,
      digital: false,
      imgCertEstudio: '/study.pdf',
    })
  })

  it('rejects empty or malformed student and request responses', () => {
    for (const response of [null, {}, { id: 0 }, { id: '' }, { id: [] }]) {
      expect(locationStudentResponseSchema.safeParse(response).success).toBe(false)
      expect(locationCreateResponseSchema.safeParse(response).success).toBe(false)
    }
  })

  it('validates type 7 catalogs and request DTO invariants', () => {
    expect(locationTypeArraySchema.parse([{ id: '7', solicitud: 'Examen', precio: '30' }])[0].precio).toBe(30)
    expect(locationTypeArraySchema.safeParse([]).success).toBe(false)
    expect(locationTypeArraySchema.safeParse([{ id: 1, solicitud: 'Certificado', precio: 30 }]).success).toBe(false)
    expect(locationRequestDtoSchema.safeParse(toLocationRequestDto(locationRequest(), 'student-1')).success).toBe(true)
    expect(locationRequestDtoSchema.safeParse({
      ...toLocationRequestDto(locationRequest(), 'student-1'),
      alumnoCiunac: false,
      imgCertEstudio: '/unexpected.pdf',
    }).success).toBe(false)
  })

  it('validates duplicate response data', () => {
    expect(locationDuplicateResponseArraySchema.safeParse([{ estadoId: 1, idiomaId: 2, tipoSolicitudId: 7 }]).success).toBe(true)
    expect(locationDuplicateResponseArraySchema.safeParse([{ estadoId: null, idiomaId: 2, tipoSolicitudId: 7 }]).success).toBe(false)
  })

  it('uses PATCH for an existing student and rejects malformed confirmation', async () => {
    const update = vi.spyOn(api, 'apiFetch').mockResolvedValueOnce({ id: 'student-1' })
    const request = locationRequest()
    request.basicData.existingStudentId = 'student-1'
    await expect(saveLocationStudent(request)).resolves.toBe('student-1')
    expect(update).toHaveBeenCalledWith('estudiantes/student-1', 'PATCH', expect.objectContaining({ imgDoc: '/identity.pdf' }))
    update.mockResolvedValueOnce({})
    await expect(saveLocationStudent(request)).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
  })

  it('posts the location envelope and preserves a 409 validation error', async () => {
    const create = vi.spyOn(api, 'apiFetch').mockResolvedValueOnce({ id: 1002 })
    await expect(createLocationRequest(locationRequest(), 'student-1')).resolves.toBe('1002')
    expect(create).toHaveBeenCalledWith('solicitudes', 'POST', expect.objectContaining({
      documentNumber: '12345678',
      request: expect.objectContaining({ pago: 30, tipoSolicitudId: 7 }),
    }))
    const conflict = new AppError({ code: 'VALIDATION', status: 409, message: 'Precio invalido' })
    create.mockRejectedValueOnce(conflict)
    await expect(createLocationRequest(locationRequest(), 'student-1')).rejects.toBe(conflict)
  })

  it('maps cargo data and distinguishes empty from malformed responses', async () => {
    const dto = locationCargoResponseSchema.parse(cargoResponse())
    expect(toLocationCargo(dto)).toMatchObject({ id: 1002, amount: 30, languageName: 'Ingles' })
    const getOptional = vi.spyOn(api, 'apiFetchOptional').mockResolvedValueOnce(null)
    await expect(findCargoById(1002)).resolves.toBeNull()
    getOptional.mockResolvedValueOnce({ id: 1002 })
    await expect(findCargoById(1002)).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
  })

  it('validates student and cargo reads before invoking their ports', async () => {
    const findByDocument = vi.fn().mockResolvedValue(null)
    await expect(findLocationStudent(' 12345678 ', findByDocument)).resolves.toBeNull()
    expect(findByDocument).toHaveBeenCalledWith('12345678')
    await expect(findLocationStudent('bad', findByDocument)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(findByDocument).toHaveBeenCalledTimes(1)

    const findById = vi.fn().mockResolvedValue(null)
    await expect(getLocationCargo(1002, findById)).resolves.toBeNull()
    await expect(getLocationCargo(0, findById)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(findById).toHaveBeenCalledTimes(1)
  })
})

describe('location file policies', () => {
  it.each([
    ['identity.PDF', 'application/pdf', null],
    ['identity.JPEG', 'image/jpeg', null],
    ['identity', 'application/pdf', 'INVALID_EXTENSION'],
    ['identity.pdf.exe', 'application/pdf', 'INVALID_EXTENSION'],
  ] as const)('reads the final extension of %s without interpreting it as an import', (name, mimeType, violation) => {
    expect(getIdentityDocumentViolation({ name, mimeType, size: 1024 })).toBe(violation)
  })

  it.each([
    ['identity.pdf', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ['identity.png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ['identity.jpg', 'image/jpeg', [0xff, 0xd8, 0xff, 0xe0]],
  ])('accepts a real %s identity document', async (name, type, bytes) => {
    const file = new File([new Uint8Array(bytes as number[])], name, { type })
    expect(getIdentityDocumentViolation({ name: file.name, size: file.size, mimeType: file.type })).toBeNull()
    const data = new FormData()
    data.set('file', file)
    await expect(validateIdentityDocumentUpload(data)).resolves.toBe(file)
  })

  it('rejects forged files and validates study certificate metadata without File dependencies', async () => {
    const forged = new File([new Uint8Array([0x00, 0x01])], 'identity.pdf', { type: 'application/pdf' })
    const data = new FormData()
    data.set('file', forged)
    await expect(validateIdentityDocumentUpload(data)).rejects.toMatchObject({ code: 'INVALID_FILE' })

    expect(getStudyCertificateViolation({ name: 'study.png', size: 5, mimeType: 'image/png' })).toBe('INVALID_MIME')
    expect(getStudyCertificateViolation({ name: 'study.pdf', size: 0, mimeType: 'application/pdf' })).toBe('EMPTY')

    const validStudy = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'study.pdf', {
      type: 'application/pdf',
    })
    const validData = new FormData()
    validData.set('file', validStudy)
    await expect(validateLocationStudyCertificateUpload(validData)).resolves.toBe(validStudy)

    const forgedStudy = new FormData()
    forgedStudy.set('file', new File(['not-pdf'], 'study.pdf', { type: 'application/pdf' }))
    await expect(validateLocationStudyCertificateUpload(forgedStudy)).rejects.toMatchObject({ code: 'INVALID_FILE' })
  })
})

describe('location workflow and registration', () => {
  beforeEach(() => useSolicitudUbicacionStore.getState().reset())

  it('uses typed commands and invalidates payment and study document when identity changes', () => {
    const request = locationRequest({ ciunac: true })
    const store = useSolicitudUbicacionStore.getState()
    expect('setSolicitudField' in store).toBe(false)
    store.initialize(request.email, true)
    store.completeBasicData(request.basicData)
    store.completePayment(request.payment)
    store.completeStudyCertificate('/study.pdf')
    store.completeBasicData({ ...request.basicData, names: 'Ana' })
    expect(useSolicitudUbicacionStore.getState().workflow.draft.payment).not.toBeNull()
    store.completeBasicData({ ...request.basicData, documentNumber: '87654321' })
    expect(useSolicitudUbicacionStore.getState().workflow.draft.payment).toBeNull()
    expect(useSolicitudUbicacionStore.getState().workflow.draft.studyCertificateUrl).toBeNull()
  })

  it('represents registration, partial success, retry and completion', () => {
    const request = locationRequest()
    const error = new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo no disponible' })
    const store = useSolicitudUbicacionStore.getState()
    store.initialize(request.email, false)
    store.beginRegistration(request)
    expect(useSolicitudUbicacionStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'registration' })
    store.markNotificationFailed('request-1', error)
    expect(useSolicitudUbicacionStore.getState().workflow.status).toBe('saved_notification_failed')
    store.beginNotificationRetry('request-1')
    store.completeRegistration('request-1', 'receipt-1')
    expect(useSolicitudUbicacionStore.getState().workflow).toMatchObject({ status: 'success', receiptId: 'receipt-1' })
  })

  it('retries only notification after a partial success', async () => {
    const save = vi.fn().mockResolvedValue('student-1')
    const create = vi.fn().mockResolvedValue('request-1')
    const sendSolicitudCreada = vi.fn()
      .mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo no disponible' }))
      .mockResolvedValueOnce('receipt-1')
    vi.spyOn(mailApiRepository, 'send').mockImplementation(({ reference }) => sendSolicitudCreada(reference))
    await expect(registerLocation(locationRequest(), {
      saveStudent: save, createRequest: create, sendNotification: sendLocationNotification,
    })).resolves.toMatchObject({
      status: 'saved_notification_failed', requestId: 'request-1',
    })
    await expect(retrySolicitudUbicacionNotification('request-1')).resolves.toBe('receipt-1')
    expect(save).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
    expect(sendSolicitudCreada).toHaveBeenCalledTimes(2)
  })
})

describe('location simplification regressions', () => {
  it.each([
    ['DNI', 'A2345678', false], ['DNI', '12345678', true],
    ['DNI', '123456789', false], ['CE', 'AB1234567', true], ['PASAPORTE', 'P12345678', true],
  ] as const)('validates %s %s at all input boundaries', (documentType, documentNumber, valid) => {
    const request = locationRequest()
    request.basicData = { ...request.basicData, documentType, documentNumber }
    expect(solicitudUbicacionDomainSchema.safeParse(request).success).toBe(valid)
    expect(locationStudentRequestDtoSchema.safeParse(toLocationStudentRequestDto(request)).success).toBe(valid)
    expect(locationBasicDataFormSchema.safeParse({ ...basicForm(), tipo_documento: documentType, dni: documentNumber }).success).toBe(valid)
  })

  it('rejects a manipulated non-CIUNAC level in the request DTO', () => {
    const dto = toLocationRequestDto(locationRequest(), 'student-1')
    expect(locationRequestDtoSchema.safeParse({ ...dto, nivelId: 2 }).success).toBe(false)
  })

  it('uses the pending/type/language rule when checking duplicates', async () => {
    const find = vi.fn().mockResolvedValue([
      { statusId: 2, requestTypeId: 7, languageId: 2 },
      { statusId: 1, requestTypeId: 1, languageId: 2 },
      { statusId: 1, requestTypeId: 7, languageId: 3 },
    ])
    const input = { documentNumber: '12345678', languageId: 2 }
    await expect(checkDuplicateLocation(input, find)).resolves.toBe(false)
    find.mockResolvedValueOnce([{ statusId: 1, requestTypeId: 7, languageId: 2 }])
    await expect(checkDuplicateLocation(input, find)).resolves.toBe(true)
  })

  it('builds a complete draft without revalidation and preserves document ownership on edits', () => {
    const store = useSolicitudUbicacionStore.getState()
    const request = locationRequest({ ciunac: true })
    store.initialize(request.email, true)
    expect(toCompleteLocationRequest(useSolicitudUbicacionStore.getState().workflow.draft)).toBeNull()
    store.completeBasicData(request.basicData)
    store.completePayment(request.payment)
    expect(toCompleteLocationRequest(useSolicitudUbicacionStore.getState().workflow.draft)).toBeNull()
    store.completeStudyCertificate(request.studyCertificateUrl!)
    expect(toCompleteLocationRequest(useSolicitudUbicacionStore.getState().workflow.draft)).toEqual(request)
    store.completeBasicData({ ...request.basicData, documentType: 'CE' })
    expect(useSolicitudUbicacionStore.getState().workflow.draft).toMatchObject({ payment: null, studyCertificateUrl: null })
  })

  it('validates before persistence and completes student, request and mail in order', async () => {
    const calls: string[] = []
    const dependencies = {
      saveStudent: vi.fn(async () => { calls.push('student'); return 'student-1' }),
      createRequest: vi.fn(async () => { calls.push('request'); return '1002' }),
      sendNotification: vi.fn(async () => { calls.push('mail'); return 'receipt-1' }),
    }
    await expect(registerLocation({ ...locationRequest(), email: '' }, dependencies)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(calls).toEqual([])
    await expect(registerLocation(locationRequest(), dependencies)).resolves.toEqual({
      status: 'completed', requestId: '1002', notificationReceiptId: 'receipt-1',
    })
    expect(calls).toEqual(['student', 'request', 'mail'])
  })

  it('preserves mail errors and never recreates a request to retry notification', async () => {
    const error = new AppError({ code: 'NETWORK', status: 503, message: 'Sin conexion', correlationId: 'test-correlation', retryable: true })
    vi.spyOn(mailApiRepository, 'send').mockRejectedValueOnce(error)
    await expect(sendLocationNotification('1002')).rejects.toBe(error)
  })

  it.each([[401, 'AUTHENTICATION'], [403, 'AUTHORIZATION'], [400, 'VALIDATION'], [503, 'EXTERNAL_SERVICE']] as const)(
    'preserves the category of profile HTTP %s errors', async (status, code) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Mensaje seguro' }, correlationId: 'profile-test',
      }), { status })))
      await expect(saveLocationProfile(false)).rejects.toMatchObject({ code, status, correlationId: 'profile-test', retryable: status >= 500 })
    },
  )

  it('distinguishes a network failure and a successful profile command', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetcher)
    await expect(saveLocationProfile(false)).rejects.toMatchObject({ code: 'NETWORK', retryable: true })
    await expect(saveLocationProfile(true)).resolves.toBeUndefined()
  })
})

function locationRequest(options: { ciunac?: boolean } = {}): SolicitudUbicacion {
  const ciunac = options.ciunac ?? false
  return {
    email: 'user@example.com',
    isCiunacStudent: ciunac,
    basicData: {
      languageId: 2,
      levelId: ciunac ? 2 : 1,
      names: 'Maria',
      lastNames: 'Perez',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '999888777',
      identityDocumentUrl: '/identity.pdf',
      existingStudentId: null,
    },
    payment: {
      amount: 30,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/voucher.pdf',
      },
    },
    studyCertificateUrl: ciunac ? '/study.pdf' : null,
  }
}

function basicForm() {
  return {
    idioma: '2', nivel: '1', apellidos: 'Perez', nombres: 'Maria', img_dni: '/identity.pdf',
    tipo_documento: 'DNI' as const, dni: '12345678', celular: '999888777', estudianteId: '',
  }
}

function paymentForm() {
  return {
    pago: '30', numero_voucher: '123456789012345',
    fecha_pago: new Date('2026-08-01T00:00:00.000Z'), img_voucher: '/voucher.pdf',
  }
}

function cargoResponse() {
  return {
    id: 1002,
    creadoEn: '2026-08-01T12:00:00.000Z',
    pago: 30,
    numeroVoucher: '123456789012345',
    fechaPago: '2026-08-01T00:00:00.000Z',
    estudiante: { nombres: 'Maria', apellidos: 'Perez', numeroDocumento: '12345678' },
    tiposSolicitud: { id: 7, solicitud: 'Examen de ubicacion' },
    idioma: { nombre: 'Ingles' },
    nivel: { nombre: 'Basico' },
  }
}

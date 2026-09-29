import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { dataResult, emptyResult, errorResult } from '@/modules/shared/application/results/app-result'
import * as api from '@/lib/api.service'
import { registerStudent, retryStudentNotification } from '@/modules/solicitud-nuevo/operations'
import { newStudentSchema } from '@/modules/solicitud-nuevo/schemas'
import { NewStudent } from '@/modules/solicitud-nuevo/model'
import { registerQ10Student, sendNewStudentNotification } from '@/modules/solicitud-nuevo/infrastructure/new-student-client'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { toQ10StudentRequestDto, isVisibleNewStudentProgram } from '@/modules/solicitud-nuevo/infrastructure/q10-api.mapper'
import {
  q10ProgramArraySchema,
  q10RegistrationResponseSchema,
  q10StudentRequestSchema,
} from '@/modules/solicitud-nuevo/infrastructure/q10-api.schemas'
import { toCompleteNewStudent, toNewStudentBasicData } from '@/modules/solicitud-nuevo/components/new-student-form.mapper'
import useNewStudentStore from '@/modules/solicitud-nuevo/store'

const programs = [{ code: 'ING', name: 'INGLES' }]

afterEach(() => vi.restoreAllMocks())

describe('new student domain and DTO contracts', () => {
  it('accepts a complete new student', () => {
    expect(newStudentSchema.parse(newStudent())).toEqual(newStudent())
  })

  it.each([
    () => ({ ...newStudent(), email: 'invalid' }),
    () => ({ ...newStudent(), phone: '123' }),
    () => ({ ...newStudent(), birthDate: '2999-01-01' }),
    () => ({ ...newStudent(), document: { type: 'DNI', number: '123' } }),
    () => ({ ...newStudent(), document: { type: 'CE', number: '12345678' } }),
  ])('rejects invalid or incomplete domain data', (candidate) => {
    expect(newStudentSchema.safeParse(candidate()).success).toBe(false)
  })

  it('accepts a nine-character alphanumeric CE', () => {
    expect(newStudentSchema.safeParse({
      ...newStudent(),
      document: { type: 'CE', number: 'ABC123456' },
    }).success).toBe(true)
  })

  it('maps the exact Q10 request DTO', () => {
    const dto = toQ10StudentRequestDto(newStudent())
    expect(dto).toEqual({
      Primer_apellido: 'PEREZ',
      Segundo_apellido: 'LOPEZ',
      Primer_nombre: 'MARIA',
      Email: 'user@example.com',
      Codigo_tipo_identificacion: 'PE01',
      Numero_identificacion: '12345678',
      Genero: 'F',
      Fecha_nacimiento: '2000-01-01T00:00:00.000Z',
      Telefono: '999888777',
      Celular: '999888777',
      Codigo_programa: 'ING',
    })
    expect(q10StudentRequestSchema.safeParse(dto).success).toBe(true)
  })

  it('maps a valid form and rejects an unavailable program', () => {
    expect(toNewStudentBasicData(basicForm(), programs)).toMatchObject({
      birthDate: '2000-01-01',
      document: { type: 'DNI', number: '12345678' },
      program: programs[0],
    })
    expect(() => toNewStudentBasicData({ ...basicForm(), code_program: 'UNKNOWN' }, programs)).toThrowError(AppError)
  })

  it('validates program responses and preserves the current visibility policy', () => {
    const parsed = q10ProgramArraySchema.parse([
      { Codigo: 'ING', Nombre: 'INGLES', Numero_resolucion: null },
      { Codigo: 'KID', Nombre: 'KIDS', Numero_resolucion: null },
      { Codigo: 'RES', Nombre: 'RESOLUCION', Numero_resolucion: 'R-1' },
    ])
    expect(parsed.filter(isVisibleNewStudentProgram).map((item) => item.Codigo)).toEqual(['ING'])
    expect(q10ProgramArraySchema.safeParse([{ Codigo: 'X' }]).success).toBe(false)
  })

  it.each([{}, { codigo: 'Q10-1' }])('accepts object registration responses', (response) => {
    expect(q10RegistrationResponseSchema.safeParse(response).success).toBe(true)
  })

  it.each([null, [], 'ok', 1])('rejects malformed registration responses', (response) => {
    expect(q10RegistrationResponseSchema.safeParse(response).success).toBe(false)
  })
})

describe('new student gateway', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('accepts a successful Q10 response with or without data', async () => {
    const postSafe = vi.spyOn(api, 'apiFetchResult')
      .mockResolvedValueOnce(emptyResult())
      .mockResolvedValueOnce(dataResult({ ok: true }))
    await expect(registerQ10Student(newStudent())).resolves.toBeUndefined()
    await expect(registerQ10Student(newStudent())).resolves.toBeUndefined()
    expect(postSafe).toHaveBeenCalledTimes(2)
  })

  it('rejects malformed and external Q10 responses', async () => {
    vi.spyOn(api, 'apiFetchResult')
      .mockResolvedValueOnce(dataResult('invalid'))
      .mockResolvedValueOnce(errorResult(new AppError({ code: 'NETWORK', message: 'Sin red' })))
    await expect(registerQ10Student(newStudent())).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    await expect(registerQ10Student(newStudent())).rejects.toMatchObject({ code: 'NETWORK' })
  })
})

describe('new student workflow', () => {
  beforeEach(() => useNewStudentStore.getState().reset())

  it('moves through editing, registration and success', () => {
    const store = useNewStudentStore.getState()
    store.initialize('USER@EXAMPLE.COM')
    store.completeBasicData(basicData())
    store.beginRegistration(newStudent())
    expect(useNewStudentStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'registration' })
    useNewStudentStore.getState().completeRegistration('12345678', 'receipt-1')
    expect(useNewStudentStore.getState().workflow).toMatchObject({ status: 'success', documentNumber: '12345678' })
  })

  it('represents notification retry and indeterminate writes', () => {
    const error = new AppError({ code: 'EXTERNAL_SERVICE', message: 'Proveedor no disponible' })
    const store = useNewStudentStore.getState()
    store.initialize('user@example.com')
    store.markNotificationFailed('12345678', error)
    expect(useNewStudentStore.getState().workflow.status).toBe('saved_notification_failed')
    useNewStudentStore.getState().beginNotificationRetry('12345678')
    expect(useNewStudentStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'notification' })
    useNewStudentStore.getState().markRegistrationFailed(error, 'indeterminate')
    expect(useNewStudentStore.getState().workflow).toMatchObject({ status: 'error', writeRisk: 'indeterminate' })
  })
})

describe('new student registration use case', () => {
  it('returns partial success and retries only the notification', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const sendRegistration = vi.fn()
      .mockRejectedValueOnce(new Error('mail unavailable'))
      .mockResolvedValueOnce('receipt-1')
    const dependencies = { registerStudent: register, sendNotification: sendRegistration }
    await expect(registerStudent(newStudent(), dependencies)).resolves.toMatchObject({
      status: 'saved_notification_failed',
      documentNumber: '12345678',
    })
    await expect(retryStudentNotification('12345678', sendRegistration)).resolves.toBe('receipt-1')
    expect(register).toHaveBeenCalledTimes(1)
    expect(sendRegistration).toHaveBeenCalledTimes(2)
  })

  it('does not call integrations for an invalid student', async () => {
    const register = vi.fn()
    const sendRegistration = vi.fn()
    const dependencies = { registerStudent: register, sendNotification: sendRegistration }
    await expect(registerStudent({ ...newStudent(), phone: '123' }, dependencies)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(register).not.toHaveBeenCalled()
    expect(sendRegistration).not.toHaveBeenCalled()
  })
})

describe('new student pragmatic operations', () => {
  it('builds only complete drafts without parsing on render', () => {
    expect(toCompleteNewStudent({ email: '', basicData: null })).toBeNull()
    expect(toCompleteNewStudent({ email: 'user@example.com', basicData: null })).toBeNull()
    expect(toCompleteNewStudent({ email: '', basicData: basicData() })).toBeNull()
    expect(toCompleteNewStudent({ email: 'user@example.com', basicData: basicData() })).toEqual(newStudent())
  })

  it('normalizes once on registration and notifies after Q10 confirms', async () => {
    const calls: string[] = []
    const student: NewStudent = { ...newStudent(), email: 'USER@EXAMPLE.COM', document: { type: 'CE', number: 'abc123456' } }
    const result = await registerStudent(student, {
      registerStudent: async (data) => {
        expect(data.email).toBe('user@example.com')
        expect(data.document.number).toBe('ABC123456')
        calls.push('q10')
      },
      sendNotification: async (reference) => {
        expect(reference).toBe('ABC123456')
        calls.push('mail')
        return 'receipt-1'
      },
    })
    expect(calls).toEqual(['q10', 'mail'])
    expect(result).toEqual({ status: 'completed', documentNumber: 'ABC123456', notificationReceiptId: 'receipt-1' })
  })

  it.each(['', '123', '../12345678'])('rejects invalid retry reference %s before the notification', (reference) => {
    const send = vi.fn()
    expect(() => retryStudentNotification(reference, send)).toThrowError(AppError)
    expect(send).not.toHaveBeenCalled()
  })

  it.each(['VALIDATION', 'AUTHENTICATION', 'AUTHORIZATION', 'NETWORK', 'EXTERNAL_SERVICE'] as const)(
    'preserves %s notification metadata in partial success', async (code) => {
      const error = new AppError({ code, status: 403, message: 'Mensaje seguro', correlationId: 'new-student-test', retryable: false })
      const send = vi.spyOn(mailApiRepository, 'send').mockRejectedValue(error)
      const register = vi.fn().mockResolvedValue(undefined)
      const result = await registerStudent(newStudent(), { registerStudent: register, sendNotification: sendNewStudentNotification })
      expect(result.status).toBe('saved_notification_failed')
      if (result.status !== 'saved_notification_failed') throw new Error('Expected partial success')
      expect(result.documentNumber).toBe('12345678')
      expect(result.error).toBe(error)
      expect(result.error).toMatchObject({ code, status: 403, correlationId: 'new-student-test', retryable: false })
      expect(register).toHaveBeenCalledTimes(1)
      expect(send).toHaveBeenCalledExactlyOnceWith({ type: 'REGISTER', reference: '12345678' })
    },
  )

  it('does not expose an unexpected provider error', async () => {
    vi.spyOn(mailApiRepository, 'send').mockRejectedValue(new Error('private provider detail'))
    await expect(sendNewStudentNotification('12345678')).rejects.toMatchObject({
      code: 'UNEXPECTED', message: 'El estudiante se guardo, pero el correo no pudo enviarse.',
    })
  })

  it('keeps a failed Q10 write separate from notification failure', async () => {
    const error = new AppError({ code: 'NETWORK', message: 'Sin conexion', correlationId: 'q10-failed', retryable: true })
    vi.spyOn(api, 'apiFetchResult').mockResolvedValue(errorResult(error))
    const send = vi.fn()
    await expect(registerStudent(newStudent(), { registerStudent: registerQ10Student, sendNotification: send }))
      .rejects.toBe(error)
    expect(send).not.toHaveBeenCalled()
  })
})

function newStudent(): NewStudent {
  return { email: 'user@example.com', ...basicData() }
}

function basicData() {
  return {
    firstLastName: 'Perez',
    secondLastName: 'Lopez',
    firstName: 'Maria',
    secondName: null,
    gender: 'F' as const,
    birthDate: '2000-01-01',
    phone: '999888777',
    document: { type: 'DNI' as const, number: '12345678' },
    program: programs[0],
  }
}

function basicForm() {
  return {
    firstLastname: 'Perez',
    secondLastname: 'Lopez',
    firstName: 'Maria',
    secondName: '',
    code_program: 'ING',
    birth_date: new Date(2000, 0, 1),
    gender: 'F' as const,
    document_type: 'DNI' as const,
    phone: '999888777',
    document: '12345678',
  }
}

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { dataResult, emptyResult, errorResult } from '@/modules/shared/application/results/app-result'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { RegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/use-cases/register-new-student.use-case'
import { newStudentSchema } from '@/modules/solicitud-nuevo/application/validation/new-student.schema'
import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'
import { Q10StudentGateway } from '@/modules/solicitud-nuevo/infrastructure/api/q10-student.gateway'
import { toQ10StudentRequestDto, isVisibleNewStudentProgram } from '@/modules/solicitud-nuevo/infrastructure/mappers/q10-api.mapper'
import {
  q10ProgramArraySchema,
  q10RegistrationResponseSchema,
  q10StudentRequestSchema,
} from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'
import { toNewStudentBasicData } from '@/modules/solicitud-nuevo/presentation/new-student-form.mapper'
import useNewStudentStore from '@/modules/solicitud-nuevo/presentation/new-student.store'

const programs = [{ code: 'ING', name: 'INGLES' }]

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
    const postSafe = vi.spyOn(resourceApiRepository, 'postSafe')
      .mockResolvedValueOnce(emptyResult())
      .mockResolvedValueOnce(dataResult({ ok: true }))
    const gateway = new Q10StudentGateway()
    await expect(gateway.register(newStudent())).resolves.toBeUndefined()
    await expect(gateway.register(newStudent())).resolves.toBeUndefined()
    expect(postSafe).toHaveBeenCalledTimes(2)
  })

  it('rejects malformed and external Q10 responses', async () => {
    vi.spyOn(resourceApiRepository, 'postSafe')
      .mockResolvedValueOnce(dataResult('invalid'))
      .mockResolvedValueOnce(errorResult(new AppError({ code: 'NETWORK', message: 'Sin red' })))
    const gateway = new Q10StudentGateway()
    await expect(gateway.register(newStudent())).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    await expect(gateway.register(newStudent())).rejects.toMatchObject({ code: 'NETWORK' })
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
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: { register },
      notificationGateway: { sendRegistration },
    })
    await expect(useCase.execute({ student: newStudent() })).resolves.toMatchObject({
      status: 'saved_notification_failed',
      documentNumber: '12345678',
    })
    await expect(useCase.retryNotification('12345678')).resolves.toBe('receipt-1')
    expect(register).toHaveBeenCalledTimes(1)
    expect(sendRegistration).toHaveBeenCalledTimes(2)
  })

  it('does not call integrations for an invalid student', async () => {
    const register = vi.fn()
    const sendRegistration = vi.fn()
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: { register },
      notificationGateway: { sendRegistration },
    })
    await expect(useCase.execute({ student: { ...newStudent(), phone: '123' } })).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(register).not.toHaveBeenCalled()
    expect(sendRegistration).not.toHaveBeenCalled()
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

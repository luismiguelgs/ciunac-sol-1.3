import { describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { emptyResult, dataResult, errorResult } from '@/modules/shared/application/results/app-result'
import IEstudiante from '@/modules/shared/interfaces/estudiante.interface'
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface'
import { RegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/use-cases/register-solicitud-certificado.use-case'
import { RegisterSolicitudBecaUseCase } from '@/modules/solicitud-beca/application/use-cases/register-solicitud-beca.use-case'
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface'
import { RegisterSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/register-solicitud-ubicacion.use-case'
import { RegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/use-cases/register-new-student.use-case'
import { RegisterSolicitudConstanciaUseCase } from '@/modules/solicitud-constancia/application/register-solicitud-constancia.use-case'
import { SolicitudConstanciaDraft } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface'
import { DocumentType, Gender } from '@/lib/constants'

const solicitud = { email: 'user@example.com', estudianteId: '' } as Isolicitud
const student = { id: 'student-1' } as IEstudiante

describe('registration use cases', () => {
  it('returns partial success and retries only the certificate email', async () => {
    const saveFromSolicitud = vi.fn().mockResolvedValue(student)
    const create = vi.fn().mockResolvedValue('request-1')
    const sendSolicitudCreada = vi.fn()
      .mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo temporalmente no disponible' }))
      .mockResolvedValueOnce('receipt-1')
    const useCase = new RegisterSolicitudCertificadoUseCase({
      studentGateway: { saveFromSolicitud },
      solicitudGateway: { create },
      notificationGateway: { sendSolicitudCreada },
    })

    await expect(useCase.execute({ solicitud })).resolves.toMatchObject({
      status: 'saved_notification_failed',
      requestId: 'request-1',
    })
    await expect(useCase.retryNotification(solicitud.email, 'request-1')).resolves.toBe('receipt-1')
    expect(saveFromSolicitud).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
    expect(sendSolicitudCreada).toHaveBeenCalledTimes(2)
  })

  it('completes scholarship registration with a receipt', async () => {
    const useCase = new RegisterSolicitudBecaUseCase({
      solicitudGateway: { create: vi.fn().mockResolvedValue('beca-1') },
      notificationGateway: { sendSolicitudCreada: vi.fn().mockResolvedValue('receipt-beca') },
    })
    const beca = { email: 'user@example.com' } as ISolicitudBeca
    await expect(useCase.execute({ solicitud: beca })).resolves.toEqual({
      status: 'completed',
      requestId: 'beca-1',
      notificationReceiptId: 'receipt-beca',
    })
  })

  it('retries only constancia notification after a partial success', async () => {
    const save = vi.fn().mockResolvedValue({ id: 'student-constancia' })
    const create = vi.fn().mockResolvedValue('request-constancia')
    const sendSolicitudCreada = vi.fn()
      .mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo no disponible' }))
      .mockResolvedValueOnce('receipt-constancia')
    const useCase = new RegisterSolicitudConstanciaUseCase({
      student: { save },
      request: { create },
      notification: { sendSolicitudCreada },
    })

    await expect(useCase.execute({ solicitud: constanciaDraft() })).resolves.toMatchObject({
      status: 'saved_notification_failed',
      requestId: 'request-constancia',
    })
    await expect(useCase.retryNotification('request-constancia')).resolves.toBe('receipt-constancia')
    expect(save).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
    expect(sendSolicitudCreada).toHaveBeenCalledTimes(2)
  })

  it('does not notify when constancia creation has no identifier', async () => {
    const sendSolicitudCreada = vi.fn()
    const useCase = new RegisterSolicitudConstanciaUseCase({
      student: { save: vi.fn().mockResolvedValue({ id: 'student-constancia' }) },
      request: { create: vi.fn().mockResolvedValue(null) },
      notification: { sendSolicitudCreada },
    })

    await expect(useCase.execute({ solicitud: constanciaDraft() })).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE',
    })
    expect(sendSolicitudCreada).not.toHaveBeenCalled()
  })

  it('rejects an invalid constancia type before calling integrations', async () => {
    const save = vi.fn()
    const create = vi.fn()
    const sendSolicitudCreada = vi.fn()
    const useCase = new RegisterSolicitudConstanciaUseCase({
      student: { save },
      request: { create },
      notification: { sendSolicitudCreada },
    })

    await expect(useCase.execute({
      solicitud: { ...constanciaDraft(), tipoSolicitudId: 1 },
    })).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(save).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    expect(sendSolicitudCreada).not.toHaveBeenCalled()
  })

  it('does not create a location request when the student response is incomplete', async () => {
    const create = vi.fn()
    const notify = vi.fn()
    const useCase = new RegisterSolicitudUbicacionUseCase({
      studentGateway: { saveFromSolicitud: vi.fn().mockResolvedValue({} as IEstudiante) },
      solicitudGateway: { create, searchByDni: vi.fn() },
      notificationGateway: { sendSolicitudCreada: notify },
    })

    await expect(useCase.execute({ solicitud })).rejects.toMatchObject({ code: 'UNEXPECTED' })
    expect(create).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })

  it('accepts an empty Q10 success and stops on mail failure', async () => {
    const register = vi.fn().mockResolvedValue(emptyResult())
    const sendRegistration = vi.fn().mockRejectedValue(new Error('provider detail'))
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: { register },
      notificationGateway: { sendRegistration },
    })

    const result = await useCase.execute(newStudent())
    expect(result).toMatchObject({ status: 'saved_notification_failed' })
    expect(register).toHaveBeenCalledTimes(1)
    expect(sendRegistration).toHaveBeenCalledTimes(1)
  })

  it('rejects a malformed Q10 success before sending mail', async () => {
    const sendRegistration = vi.fn()
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: { register: vi.fn().mockResolvedValue(dataResult('invalid')) },
      notificationGateway: { sendRegistration },
    })

    await expect(useCase.execute(newStudent())).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(sendRegistration).not.toHaveBeenCalled()
  })

  it.each([
    ['VALIDATION', 400],
    ['EXTERNAL_SERVICE', 500],
  ] as const)('stops before mail when Q10 returns %s', async (code, status) => {
    const sendRegistration = vi.fn()
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: {
        register: vi.fn().mockResolvedValue(errorResult(new AppError({
          code,
          status,
          message: 'Respuesta Q10 normalizada',
          retryable: status >= 500,
        }))),
      },
      notificationGateway: { sendRegistration },
    })

    await expect(useCase.execute(newStudent())).rejects.toMatchObject({ code, status })
    expect(sendRegistration).not.toHaveBeenCalled()
  })
})

function newStudent(): IStudent {
  return {
    Primer_apellido: 'Perez',
    Segundo_apellido: 'Lopez',
    Primer_nombre: 'Maria',
    Email: 'user@example.com',
    Codigo_tipo_identificacion: DocumentType.PE01,
    Numero_identificacion: '12345678',
    Genero: Gender.F,
    Fecha_nacimiento: '2000-01-01',
    Telefono: '999888777',
    Celular: '999888777',
    Codigo_programa: 'ING',
  }
}

function constanciaDraft(): SolicitudConstanciaDraft {
  return {
    email: 'user@example.com',
    tipoSolicitudId: 5,
    idiomaId: 2,
    nivelId: 1,
    nombres: 'Maria',
    apellidos: 'Perez',
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678',
    celular: '999888777',
    alumnoUnac: false,
    pago: 30,
    numeroVoucher: '123456789012345',
    fechaPago: '2026-08-01T00:00:00.000Z',
    voucherUrl: '/vouchers/fixture.png',
  }
}

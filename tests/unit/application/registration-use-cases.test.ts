import { describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { RegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/use-cases/register-solicitud-certificado.use-case'
import { SolicitudCertificado } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { RegisterSolicitudBecaUseCase } from '@/modules/solicitud-beca/application/use-cases/register-solicitud-beca.use-case'
import { SolicitudBeca } from '@/modules/solicitud-beca/domain/solicitud-beca'
import { RegisterSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/register-solicitud-ubicacion.use-case'
import { SolicitudUbicacion } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { RegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/use-cases/register-new-student.use-case'
import { RegisterSolicitudConstanciaUseCase } from '@/modules/solicitud-constancia/application/register-solicitud-constancia.use-case'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'

describe('registration use cases', () => {
  it('returns partial success and retries only the certificate email', async () => {
    const save = vi.fn().mockResolvedValue('student-1')
    const create = vi.fn().mockResolvedValue('request-1')
    const sendSolicitudCreada = vi.fn()
      .mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo temporalmente no disponible' }))
      .mockResolvedValueOnce('receipt-1')
    const useCase = new RegisterSolicitudCertificadoUseCase({
      studentGateway: { save },
      solicitudGateway: { create },
      notificationGateway: { sendSolicitudCreada },
    })
    const certificate = certificateDraft()

    await expect(useCase.execute({ solicitud: certificate })).resolves.toMatchObject({
      status: 'saved_notification_failed',
      requestId: 'request-1',
    })
    await expect(useCase.retryNotification('request-1')).resolves.toBe('receipt-1')
    expect(save).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith(certificate, 'student-1')
    expect(sendSolicitudCreada).toHaveBeenCalledTimes(2)
  })

  it('completes scholarship registration with a receipt', async () => {
    const useCase = new RegisterSolicitudBecaUseCase({
      solicitudGateway: { create: vi.fn().mockResolvedValue('beca-1') },
      notificationGateway: { sendSolicitudCreada: vi.fn().mockResolvedValue('receipt-beca') },
    })
    const beca = scholarshipDraft()
    await expect(useCase.execute({ solicitud: beca })).resolves.toEqual({
      status: 'completed',
      requestId: 'beca-1',
      notificationReceiptId: 'receipt-beca',
    })
  })

  it('retries only constancia notification after a partial success', async () => {
    const save = vi.fn().mockResolvedValue('student-constancia')
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
      student: { save: vi.fn().mockResolvedValue('student-constancia') },
      request: {
        create: vi.fn().mockRejectedValue(new AppError({
          code: 'EXTERNAL_SERVICE',
          message: 'La API no devolvio un identificador valido',
        })),
      },
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
      solicitud: {
        ...constanciaDraft(),
        basicData: { ...constanciaDraft().basicData, typeId: 1 },
      } as unknown as SolicitudConstancia,
    })).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(save).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    expect(sendSolicitudCreada).not.toHaveBeenCalled()
  })

  it('does not create a location request when saving the student fails', async () => {
    const create = vi.fn()
    const notify = vi.fn()
    const useCase = new RegisterSolicitudUbicacionUseCase({
      studentGateway: { save: vi.fn().mockRejectedValue(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Student response invalid' })) },
      solicitudGateway: { create, searchByDocument: vi.fn() },
      notificationGateway: { sendSolicitudCreada: notify },
    })

    await expect(useCase.execute({ solicitud: locationDraft() })).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(create).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })

  it('accepts a Q10 command success and stops on mail failure', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const sendRegistration = vi.fn().mockRejectedValue(new Error('provider detail'))
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: { register },
      notificationGateway: { sendRegistration },
    })

    const result = await useCase.execute({ student: newStudent() })
    expect(result).toMatchObject({ status: 'saved_notification_failed' })
    expect(register).toHaveBeenCalledTimes(1)
    expect(sendRegistration).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['VALIDATION', 400],
    ['EXTERNAL_SERVICE', 500],
  ] as const)('stops before mail when Q10 returns %s', async (code, status) => {
    const sendRegistration = vi.fn()
    const useCase = new RegisterNewStudentUseCase({
      studentGateway: {
        register: vi.fn().mockRejectedValue(new AppError({
          code,
          status,
          message: 'Respuesta Q10 normalizada',
          retryable: status >= 500,
        })),
      },
      notificationGateway: { sendRegistration },
    })

    await expect(useCase.execute({ student: newStudent() })).rejects.toMatchObject({ code, status })
    expect(sendRegistration).not.toHaveBeenCalled()
  })
})

function newStudent(): NewStudent {
  return {
    email: 'user@example.com',
    firstLastName: 'Perez',
    secondLastName: 'Lopez',
    firstName: 'Maria',
    secondName: null,
    gender: 'F',
    birthDate: '2000-01-01',
    phone: '999888777',
    document: { type: 'DNI', number: '12345678' },
    program: { code: 'ING', name: 'Ingles' },
  }
}

function constanciaDraft(): SolicitudConstancia {
  return {
    email: 'user@example.com',
    basicData: {
      typeId: 5,
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
    payment: {
      amount: 30,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/vouchers/fixture.png',
      },
    },
  }
}

function certificateDraft(): SolicitudCertificado {
  return {
    email: 'user@example.com',
    basicData: {
      typeId: 1,
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
    payment: {
      amount: 30,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/vouchers/fixture.png',
      },
    },
  }
}

function locationDraft(): SolicitudUbicacion {
  return {
    email: 'user@example.com',
    isCiunacStudent: false,
    basicData: {
      languageId: 2,
      levelId: 1,
      names: 'Maria',
      lastNames: 'Perez',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '999888777',
      identityDocumentUrl: '/documents/dni.pdf',
      existingStudentId: null,
    },
    payment: {
      amount: 30,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/vouchers/fixture.pdf',
      },
    },
    studyCertificateUrl: null,
  }
}

function scholarshipDraft(): SolicitudBeca {
  return {
    email: 'user@example.com',
    basicData: {
      names: 'Maria',
      lastNames: 'Perez',
      phone: '999888777',
      documentType: 'DNI',
      documentNumber: '12345678',
      address: 'Callao',
      studentCode: '20260001',
      faculty: { id: 1, name: 'Ingenieria' },
      school: { id: 2, name: 'Sistemas' },
    },
    documents: {
      enrollmentCertificateUrl: '/files/matricula.pdf',
      academicHistoryUrl: '/files/historial.pdf',
      meritCertificateUrl: '/files/tercio.pdf',
      commitmentLetterUrl: '/files/compromiso.pdf',
      swornDeclarationUrl: '/files/declaracion.pdf',
    },
  }
}

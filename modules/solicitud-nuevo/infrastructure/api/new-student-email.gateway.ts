import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { NewStudentNotificationGateway } from '@/modules/solicitud-nuevo/application/ports/register-new-student.ports';
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'

export class NewStudentEmailGateway implements NewStudentNotificationGateway {
  async sendRegistration(documentNumber: string): Promise<string> {
    try {
      return await mailApiRepository.send({ type: 'REGISTER', reference: documentNumber })
    } catch (error) {
      const appError = normalizeAppError(error, 'El estudiante se guardo, pero el correo no pudo enviarse.')
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        cause: error,
        retryable: true,
      })
    }
  }
}

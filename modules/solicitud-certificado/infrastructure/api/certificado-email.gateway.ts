import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { NotificationGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports'

export class CertificadoEmailGateway implements NotificationGateway {
  async sendSolicitudCreada(requestId: string): Promise<string> {
    try {
      return await mailApiRepository.send({ type: 'CERTIFICADO', reference: requestId })
    } catch (error) {
      const appError = normalizeAppError(error, 'La solicitud se guardo, pero el correo no pudo enviarse')
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

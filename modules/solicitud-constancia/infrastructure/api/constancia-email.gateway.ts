import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import type { ConstanciaNotificationGateway } from '@/modules/solicitud-constancia/application/ports/register-solicitud-constancia.ports'

export class ConstanciaEmailGateway implements ConstanciaNotificationGateway {
  async sendSolicitudCreada(requestId: string): Promise<string> {
    try {
      return await mailApiRepository.send({ type: 'CONSTANCIA', reference: requestId })
    } catch (error) {
      const appError = normalizeAppError(error, 'La solicitud se guardo, pero el correo no pudo procesarse.')
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        correlationId: appError.correlationId,
        retryable: true,
        cause: error,
      })
    }
  }
}

import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudBecaNotificationGateway } from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'

export class BecaEmailGateway implements SolicitudBecaNotificationGateway {
  async sendSolicitudCreada(requestId: string): Promise<string> {
    try {
      return await mailApiRepository.send({ type: 'BECA', reference: requestId })
    } catch (error) {
      const appError = normalizeAppError(error, 'La solicitud de beca se guardo, pero el correo no pudo enviarse');
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        cause: error,
        retryable: true,
      });
    }
  }
}

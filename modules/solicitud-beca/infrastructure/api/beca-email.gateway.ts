import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudBecaNotificationGateway } from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';
import EmailService from '@/services/email.service';

export class BecaEmailGateway implements SolicitudBecaNotificationGateway {
  async sendSolicitudCreada(email: string, requestId: string): Promise<void> {
    try {
      await EmailService.sendEmailBeca(email, requestId);
    } catch (error) {
      const appError = normalizeAppError(error, 'La solicitud de beca se guardo, pero el correo no pudo enviarse');
      throw new AppError({
        code: 'INTEGRATION',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }
}

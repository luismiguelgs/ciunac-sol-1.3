import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudUbicacionNotificationGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';
import EmailService from '@/services/email.service';

export class UbicacionEmailGateway implements SolicitudUbicacionNotificationGateway {
  async sendSolicitudCreada(email: string, requestId: string): Promise<string> {
    try {
      return await EmailService.sendEmailUbicacion(email, requestId);
    } catch (error) {
      const appError = normalizeAppError(error, 'La solicitud de ubicacion se guardo, pero el correo no pudo enviarse');
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

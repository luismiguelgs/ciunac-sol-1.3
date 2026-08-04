import EmailService from '@/services/email.service';
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { NotificationGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports';

export class CertificadoEmailGateway implements NotificationGateway {
  async sendSolicitudCreada(email: string, requestId: string): Promise<string> {
    try {
      return await EmailService.sendEmailCertificado(email, requestId);
    } catch (error) {
      const appError = normalizeAppError(error, 'La solicitud se guardo, pero el correo no pudo enviarse');
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

import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudCertificadoCommand } from '@/modules/solicitud-certificado/application/commands/register-solicitud-certificado.command';
import {
  NotificationGateway,
  SolicitudGateway,
  StudentGateway,
} from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports';
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome';

type Dependencies = {
  studentGateway: StudentGateway;
  solicitudGateway: SolicitudGateway;
  notificationGateway: NotificationGateway;
};

export class RegisterSolicitudCertificadoUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudCertificadoCommand): Promise<RegistrationOutcome> {
    try {
      const student = await this.dependencies.studentGateway.saveFromSolicitud(solicitud);
      if (!student?.id) {
        throw new Error('Student response is incomplete');
      }
      const requestId = await this.dependencies.solicitudGateway.create({
        ...solicitud,
        estudianteId: student.id,
      });

      if (!requestId) {
        throw new Error('No se pudo registrar la solicitud');
      }

      try {
        const notificationReceiptId = await this.retryNotification(solicitud.email, requestId);
        return { status: 'completed', requestId, notificationReceiptId };
      } catch (error) {
        return {
          status: 'saved_notification_failed',
          requestId,
          error: normalizeAppError(error, 'La solicitud se guardo, pero no se pudo procesar el correo.'),
        };
      }
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud');
    }
  }

  retryNotification(email: string, requestId: string): Promise<string> {
    return this.dependencies.notificationGateway.sendSolicitudCreada(email, requestId);
  }
}

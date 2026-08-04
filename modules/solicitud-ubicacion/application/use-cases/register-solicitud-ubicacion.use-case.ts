import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudUbicacionCommand } from '@/modules/solicitud-ubicacion/application/commands/register-solicitud-ubicacion.command';
import {
  SolicitudUbicacionGateway,
  SolicitudUbicacionNotificationGateway,
  StudentUbicacionGateway,
} from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome';

type Dependencies = {
  studentGateway: StudentUbicacionGateway;
  solicitudGateway: SolicitudUbicacionGateway;
  notificationGateway: SolicitudUbicacionNotificationGateway;
};

export class RegisterSolicitudUbicacionUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudUbicacionCommand): Promise<RegistrationOutcome> {
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
        throw new Error('No se pudo registrar la solicitud de ubicacion');
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
      throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud de ubicacion');
    }
  }

  retryNotification(email: string, requestId: string): Promise<string> {
    return this.dependencies.notificationGateway.sendSolicitudCreada(email, requestId);
  }
}

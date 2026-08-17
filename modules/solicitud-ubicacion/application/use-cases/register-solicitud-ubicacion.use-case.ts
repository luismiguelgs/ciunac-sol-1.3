import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudUbicacionCommand } from '@/modules/solicitud-ubicacion/application/commands/register-solicitud-ubicacion.command';
import {
  SolicitudUbicacionGateway,
  SolicitudUbicacionNotificationGateway,
  StudentUbicacionGateway,
} from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome';
import { parseSolicitudUbicacion } from '@/modules/solicitud-ubicacion/application/validation/solicitud-ubicacion.schema'

type Dependencies = {
  studentGateway: StudentUbicacionGateway;
  solicitudGateway: SolicitudUbicacionGateway;
  notificationGateway: SolicitudUbicacionNotificationGateway;
};

export class RegisterSolicitudUbicacionUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudUbicacionCommand): Promise<RegistrationOutcome> {
    try {
      const request = parseSolicitudUbicacion(solicitud)
      const studentId = await this.dependencies.studentGateway.save(request)
      const requestId = await this.dependencies.solicitudGateway.create(request, studentId)

      try {
        const notificationReceiptId = await this.retryNotification(requestId);
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

  retryNotification(requestId: string): Promise<string> {
    return this.dependencies.notificationGateway.sendSolicitudCreada(requestId)
  }
}

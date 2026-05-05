import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudUbicacionCommand } from '@/modules/solicitud-ubicacion/application/commands/register-solicitud-ubicacion.command';
import {
  SolicitudUbicacionGateway,
  SolicitudUbicacionNotificationGateway,
  StudentUbicacionGateway,
} from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';

type Dependencies = {
  studentGateway: StudentUbicacionGateway;
  solicitudGateway: SolicitudUbicacionGateway;
  notificationGateway: SolicitudUbicacionNotificationGateway;
};

export class RegisterSolicitudUbicacionUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudUbicacionCommand) {
    try {
      const student = await this.dependencies.studentGateway.saveFromSolicitud(solicitud);
      const requestId = await this.dependencies.solicitudGateway.create({
        ...solicitud,
        estudianteId: student.id ?? '',
      });

      if (!requestId) {
        throw new Error('No se pudo registrar la solicitud de ubicacion');
      }

      await this.dependencies.notificationGateway.sendSolicitudCreada(solicitud.email, requestId);

      return {
        requestId,
        message: 'Solicitud guardada correctamente',
      };
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud de ubicacion');
    }
  }
}

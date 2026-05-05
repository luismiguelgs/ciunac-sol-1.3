import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudCertificadoCommand } from '@/modules/solicitud-certificado/application/commands/register-solicitud-certificado.command';
import {
  NotificationGateway,
  SolicitudGateway,
  StudentGateway,
} from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports';

export type RegisterSolicitudCertificadoResult = {
  requestId: string;
  message: string;
};

type Dependencies = {
  studentGateway: StudentGateway;
  solicitudGateway: SolicitudGateway;
  notificationGateway: NotificationGateway;
};

export class RegisterSolicitudCertificadoUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudCertificadoCommand): Promise<RegisterSolicitudCertificadoResult> {
    try {
      const student = await this.dependencies.studentGateway.saveFromSolicitud(solicitud);
      const requestId = await this.dependencies.solicitudGateway.create({
        ...solicitud,
        estudianteId: student.id ?? '',
      });

      if (!requestId) {
        throw new Error('No se pudo registrar la solicitud');
      }

      await this.dependencies.notificationGateway.sendSolicitudCreada(solicitud.email, requestId);

      return {
        requestId,
        message: 'Solicitud guardada correctamente',
      };
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud');
    }
  }
}

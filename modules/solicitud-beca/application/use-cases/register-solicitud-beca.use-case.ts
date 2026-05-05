import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudBecaCommand } from '@/modules/solicitud-beca/application/commands/register-solicitud-beca.command';
import {
  SolicitudBecaGateway,
  SolicitudBecaNotificationGateway,
} from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';

type Dependencies = {
  solicitudGateway: SolicitudBecaGateway;
  notificationGateway: SolicitudBecaNotificationGateway;
};

export class RegisterSolicitudBecaUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudBecaCommand) {
    try {
      const requestId = await this.dependencies.solicitudGateway.create(solicitud);

      if (!requestId) {
        throw new Error('No se pudo registrar la solicitud de beca');
      }

      await this.dependencies.notificationGateway.sendSolicitudCreada(solicitud.email, requestId);

      return {
        requestId,
        message: 'Solicitud guardada correctamente',
      };
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud de beca');
    }
  }
}

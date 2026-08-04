import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudBecaCommand } from '@/modules/solicitud-beca/application/commands/register-solicitud-beca.command';
import {
  SolicitudBecaGateway,
  SolicitudBecaNotificationGateway,
} from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome';

type Dependencies = {
  solicitudGateway: SolicitudBecaGateway;
  notificationGateway: SolicitudBecaNotificationGateway;
};

export class RegisterSolicitudBecaUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudBecaCommand): Promise<RegistrationOutcome> {
    try {
      const requestId = await this.dependencies.solicitudGateway.create(solicitud);

      if (!requestId) {
        throw new Error('No se pudo registrar la solicitud de beca');
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
      throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud de beca');
    }
  }

  retryNotification(email: string, requestId: string): Promise<string> {
    return this.dependencies.notificationGateway.sendSolicitudCreada(email, requestId);
  }
}

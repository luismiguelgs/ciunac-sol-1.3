import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterSolicitudBecaCommand } from '@/modules/solicitud-beca/application/commands/register-solicitud-beca.command';
import {
  SolicitudBecaGateway,
  SolicitudBecaNotificationGateway,
} from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome';
import { parseSolicitudBeca } from '@/modules/solicitud-beca/schemas/solicitud-beca.schema'

type Dependencies = {
  solicitudGateway: SolicitudBecaGateway;
  notificationGateway: SolicitudBecaNotificationGateway;
};

export class RegisterSolicitudBecaUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudBecaCommand): Promise<RegistrationOutcome> {
    try {
      const validSolicitud = parseSolicitudBeca(solicitud)
      const requestId = await this.dependencies.solicitudGateway.create(validSolicitud)

      try {
        const notificationReceiptId = await this.retryNotification(requestId)
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

  retryNotification(requestId: string): Promise<string> {
    return this.dependencies.notificationGateway.sendSolicitudCreada(requestId)
  }
}

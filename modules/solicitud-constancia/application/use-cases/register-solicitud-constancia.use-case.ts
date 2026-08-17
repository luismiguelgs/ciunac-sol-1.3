import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import type { RegisterSolicitudConstanciaCommand } from '@/modules/solicitud-constancia/application/commands/register-solicitud-constancia.command'
import type {
  ConstanciaNotificationGateway,
  ConstanciaRequestGateway,
  ConstanciaStudentGateway,
} from '@/modules/solicitud-constancia/application/ports/register-solicitud-constancia.ports'
import { parseSolicitudConstancia } from '@/modules/solicitud-constancia/application/validation/solicitud-constancia.schema'

type Dependencies = {
  studentGateway: ConstanciaStudentGateway
  requestGateway: ConstanciaRequestGateway
  notificationGateway: ConstanciaNotificationGateway
}

export class RegisterSolicitudConstanciaUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ solicitud }: RegisterSolicitudConstanciaCommand): Promise<RegistrationOutcome> {
    try {
      const request = parseSolicitudConstancia(solicitud)
      const studentId = await this.dependencies.studentGateway.save(request)
      const requestId = await this.dependencies.requestGateway.create(request, studentId)

      try {
        const notificationReceiptId = await this.retryNotification(requestId)
        return { status: 'completed', requestId, notificationReceiptId }
      } catch (error) {
        return {
          status: 'saved_notification_failed',
          requestId,
          error: normalizeAppError(error, 'La solicitud se guardo, pero no se pudo procesar el correo.'),
        }
      }
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo completar el registro de la constancia.')
    }
  }

  retryNotification(requestId: string): Promise<string> {
    return this.dependencies.notificationGateway.sendSolicitudCreada(requestId)
  }
}

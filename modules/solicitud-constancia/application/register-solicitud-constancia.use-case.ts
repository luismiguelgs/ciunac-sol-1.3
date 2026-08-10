import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { parseSolicitudConstancia } from '@/modules/solicitud-constancia/schemas/solicitud-constancia.schema'

export type RegisterSolicitudConstanciaCommand = {
  solicitud: SolicitudConstancia
}

export interface ConstanciaStudentPort {
  save(solicitud: SolicitudConstancia): Promise<string>
}

export interface ConstanciaRequestPort {
  create(solicitud: SolicitudConstancia, studentId: string): Promise<string>
}

export interface ConstanciaNotificationPort {
  sendSolicitudCreada(requestId: string): Promise<string>
}

type Dependencies = {
  student: ConstanciaStudentPort
  request: ConstanciaRequestPort
  notification: ConstanciaNotificationPort
}

export class RegisterSolicitudConstanciaUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(command: RegisterSolicitudConstanciaCommand): Promise<RegistrationOutcome> {
    try {
      const solicitud = parseSolicitudConstancia(command.solicitud)
      const studentId = await this.dependencies.student.save(solicitud)
      const requestId = await this.dependencies.request.create(solicitud, studentId)

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
    return this.dependencies.notification.sendSolicitudCreada(requestId)
  }
}

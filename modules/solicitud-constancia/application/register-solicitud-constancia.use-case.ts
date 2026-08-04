import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import {
  SolicitudConstanciaDraft,
  validateSolicitudConstancia,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export type RegisterSolicitudConstanciaCommand = {
  solicitud: SolicitudConstanciaDraft
}

export interface ConstanciaStudentPort {
  save(solicitud: SolicitudConstanciaDraft): Promise<{ id?: string }>
}

export interface ConstanciaRequestPort {
  create(solicitud: SolicitudConstanciaDraft, studentId: string): Promise<string | null>
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

  async execute({ solicitud }: RegisterSolicitudConstanciaCommand): Promise<RegistrationOutcome> {
    try {
      const validationError = validateSolicitudConstancia(solicitud)
      if (validationError) {
        throw new AppError({ code: 'VALIDATION', status: 400, message: validationError })
      }

      const student = await this.dependencies.student.save(solicitud)
      if (!student.id) {
        throw new AppError({
          code: 'EXTERNAL_SERVICE',
          message: 'No se pudo confirmar el registro del estudiante.',
        })
      }

      const requestId = await this.dependencies.request.create(solicitud, student.id)
      if (!requestId) {
        throw new AppError({
          code: 'EXTERNAL_SERVICE',
          message: 'No se pudo confirmar el identificador de la solicitud.',
        })
      }

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

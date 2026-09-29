import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import type { SolicitudBeca } from './model'
import { parseSolicitudBeca } from './schemas'

type ScholarshipRegistrationDependencies = {
  createRequest: (solicitud: SolicitudBeca) => Promise<string>
  sendNotification: (requestId: string) => Promise<string>
}

export async function registerScholarship(
  solicitud: SolicitudBeca,
  dependencies: ScholarshipRegistrationDependencies,
): Promise<RegistrationOutcome> {
  try {
    const validSolicitud = parseSolicitudBeca(solicitud)
    const requestId = await dependencies.createRequest(validSolicitud)

    try {
      const notificationReceiptId = await dependencies.sendNotification(requestId)
      return { status: 'completed', requestId, notificationReceiptId }
    } catch (error) {
      return {
        status: 'saved_notification_failed',
        requestId,
        error: normalizeAppError(error, 'La solicitud se guardo, pero no se pudo procesar el correo.'),
      }
    }
  } catch (error) {
    throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud de beca')
  }
}

import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import {
  isConstanciaDocumentNumber,
  normalizeConstanciaDocumentNumber,
  type ConstanciaCargo,
  type ConstanciaStudentLookup,
  type SolicitudConstancia,
} from './model'
import { parseSolicitudConstancia } from './schemas'

type RegistrationDependencies = {
  saveStudent: (request: SolicitudConstancia) => Promise<string>
  createRequest: (request: SolicitudConstancia, studentId: string) => Promise<string>
  sendNotification: (requestId: string) => Promise<string>
}

export async function registerConstancia(
  solicitud: SolicitudConstancia,
  dependencies: RegistrationDependencies,
): Promise<RegistrationOutcome> {
  try {
    const request = parseSolicitudConstancia(solicitud)
    const studentId = await dependencies.saveStudent(request)
    const requestId = await dependencies.createRequest(request, studentId)

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
    throw normalizeAppError(error, 'No se pudo completar el registro de la constancia.')
  }
}

export async function findConstanciaStudent(
  documentNumber: string,
  find: (document: string) => Promise<ConstanciaStudentLookup | null>,
): Promise<ConstanciaStudentLookup | null> {
  const document = normalizeConstanciaDocumentNumber(documentNumber)
  if (!isConstanciaDocumentNumber(document)) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El documento ingresado no es valido.' })
  }
  return find(document)
}

export async function getConstanciaCargo(
  requestId: number,
  find: (id: number) => Promise<ConstanciaCargo | null>,
): Promise<ConstanciaCargo | null> {
  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El identificador de la solicitud no es valido.' })
  }
  return find(requestId)
}

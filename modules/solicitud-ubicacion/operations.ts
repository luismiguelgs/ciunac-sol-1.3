import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import {
  hasPendingLocationRequest,
  isLocationDocumentNumber,
  normalizeLocationDocumentNumber,
  type ExistingLocationRequest,
  type LocationCargo,
  type LocationStudentLookup,
  type SolicitudUbicacion,
} from './model'
import { parseSolicitudUbicacion } from './schemas'

type RegistrationDependencies = {
  saveStudent: (request: SolicitudUbicacion) => Promise<string>
  createRequest: (request: SolicitudUbicacion, studentId: string) => Promise<string>
  sendNotification: (requestId: string) => Promise<string>
}

export async function registerLocation(
  solicitud: SolicitudUbicacion,
  dependencies: RegistrationDependencies,
): Promise<RegistrationOutcome> {
  try {
    const request = parseSolicitudUbicacion(solicitud)
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
    throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud de ubicacion')
  }
}

export async function findLocationStudent(
  documentNumber: string,
  find: (document: string) => Promise<LocationStudentLookup | null>,
): Promise<LocationStudentLookup | null> {
  return find(validDocument(documentNumber))
}

export async function getLocationCargo(
  requestId: number,
  find: (id: number) => Promise<LocationCargo | null>,
): Promise<LocationCargo | null> {
  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El identificador de la solicitud no es valido.' })
  }
  return find(requestId)
}

export async function checkDuplicateLocation(
  input: { documentNumber: string; languageId: number },
  find: (document: string) => Promise<ExistingLocationRequest[]>,
): Promise<boolean> {
  try {
    const requests = await find(validDocument(input.documentNumber))
    return hasPendingLocationRequest(requests, input.languageId)
  } catch (error) {
    throw normalizeAppError(error, 'No se pudo verificar duplicidad de solicitud')
  }
}

function validDocument(value: string): string {
  const document = normalizeLocationDocumentNumber(value)
  if (!isLocationDocumentNumber(document)) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El documento ingresado no es valido.' })
  }
  return document
}

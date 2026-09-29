import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type { RegistrationOutcome } from '@/modules/shared/application/results/registration-outcome'
import {
  isCertificateDocumentNumber,
  normalizeCertificateDocumentNumber,
  type CertificateCargo,
  type CertificateStudentLookup,
  type SolicitudCertificado,
} from './model'
import { parseSolicitudCertificado } from './schemas'

type RegistrationDependencies = {
  saveStudent: (request: SolicitudCertificado) => Promise<string>
  createRequest: (request: SolicitudCertificado, studentId: string) => Promise<string>
  sendNotification: (requestId: string) => Promise<string>
}

export async function registerCertificate(
  solicitud: SolicitudCertificado,
  dependencies: RegistrationDependencies,
): Promise<RegistrationOutcome> {
  try {
    const request = parseSolicitudCertificado(solicitud)
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
    throw normalizeAppError(error, 'No se pudo completar el registro de la solicitud')
  }
}

export async function findCertificateStudent(
  documentNumber: string,
  find: (document: string) => Promise<CertificateStudentLookup | null>,
): Promise<CertificateStudentLookup | null> {
  const document = normalizeCertificateDocumentNumber(documentNumber)
  if (!isCertificateDocumentNumber(document)) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El documento ingresado no es valido.' })
  }
  return find(document)
}

export async function getCertificateCargo(
  requestId: number,
  find: (id: number) => Promise<CertificateCargo | null>,
): Promise<CertificateCargo | null> {
  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El identificador de la solicitud no es valido.' })
  }
  return find(requestId)
}

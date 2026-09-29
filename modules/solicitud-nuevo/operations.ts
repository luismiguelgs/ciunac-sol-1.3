import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type { NewStudent } from './model'
import { parseNewStudent } from './schemas'

type RegisterNewStudentOutcome =
  | { status: 'completed'; documentNumber: string; notificationReceiptId: string }
  | { status: 'saved_notification_failed'; documentNumber: string; error: AppError }

type RegistrationDependencies = {
  registerStudent: (student: NewStudent) => Promise<void>
  sendNotification: (documentNumber: string) => Promise<string>
}

export async function registerStudent(
  student: NewStudent,
  dependencies: RegistrationDependencies,
): Promise<RegisterNewStudentOutcome> {
  const validStudent = parseNewStudent(student)
  await dependencies.registerStudent(validStudent)
  const documentNumber = validStudent.document.number

  try {
    const notificationReceiptId = await retryStudentNotification(documentNumber, dependencies.sendNotification)
    return { status: 'completed', documentNumber, notificationReceiptId }
  } catch (error) {
    return {
      status: 'saved_notification_failed',
      documentNumber,
      error: normalizeAppError(error, 'El estudiante se guardo, pero no se pudo procesar el correo.'),
    }
  }
}

export function retryStudentNotification(
  documentNumber: string,
  send: (documentNumber: string) => Promise<string>,
): Promise<string> {
  if (!/^[A-Za-z0-9]{8,9}$/.test(documentNumber)) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'La referencia del estudiante no es valida.' })
  }
  return send(documentNumber)
}

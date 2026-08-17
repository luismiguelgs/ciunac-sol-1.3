import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { RegisterNewStudentCommand } from '@/modules/solicitud-nuevo/application/commands/register-new-student.command'
import {
  NewStudentGateway,
  NewStudentNotificationGateway,
} from '@/modules/solicitud-nuevo/application/ports/register-new-student.ports';
import { parseNewStudent } from '@/modules/solicitud-nuevo/application/validation/new-student.schema'

export type RegisterNewStudentOutcome =
  | { status: 'completed'; documentNumber: string; notificationReceiptId: string }
  | { status: 'saved_notification_failed'; documentNumber: string; error: AppError };

type Dependencies = {
  studentGateway: NewStudentGateway;
  notificationGateway: NewStudentNotificationGateway;
};

export class RegisterNewStudentUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute({ student }: RegisterNewStudentCommand): Promise<RegisterNewStudentOutcome> {
    const validStudent = parseNewStudent(student)
    await this.dependencies.studentGateway.register(validStudent)
    const documentNumber = validStudent.document.number

    try {
      const notificationReceiptId = await this.retryNotification(documentNumber)
      return { status: 'completed', documentNumber, notificationReceiptId };
    } catch (error) {
      return {
        status: 'saved_notification_failed',
        documentNumber,
        error: normalizeAppError(error, 'El estudiante se guardo, pero no se pudo procesar el correo.'),
      };
    }
  }

  retryNotification(documentNumber: string): Promise<string> {
    if (!/^[A-Za-z0-9]{8,9}$/.test(documentNumber)) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'La referencia del estudiante no es valida.',
      })
    }
    return this.dependencies.notificationGateway.sendRegistration(documentNumber)
  }
}

import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface';
import {
  NewStudentGateway,
  NewStudentNotificationGateway,
} from '@/modules/solicitud-nuevo/application/ports/register-new-student.ports';

export type RegisterNewStudentOutcome =
  | { status: 'completed'; notificationReceiptId: string }
  | { status: 'saved_notification_failed'; error: AppError };

type Dependencies = {
  studentGateway: NewStudentGateway;
  notificationGateway: NewStudentNotificationGateway;
};

export class RegisterNewStudentUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(student: IStudent): Promise<RegisterNewStudentOutcome> {
    const normalizedStudent = normalizeStudent(student);
    const saveResult = await this.dependencies.studentGateway.register(normalizedStudent);

    if (!saveResult.ok) throw saveResult.error;
    if (saveResult.kind === 'data' && !isRecord(saveResult.data)) {
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: 'Q10 devolvio una respuesta no valida. No vuelva a registrar al estudiante.',
      });
    }

    try {
      const notificationReceiptId = await this.retryNotification(normalizedStudent);
      return { status: 'completed', notificationReceiptId };
    } catch (error) {
      return {
        status: 'saved_notification_failed',
        error: normalizeAppError(error, 'El estudiante se guardo, pero no se pudo procesar el correo.'),
      };
    }
  }

  retryNotification(student: IStudent): Promise<string> {
    return this.dependencies.notificationGateway.sendRegistration(normalizeStudent(student));
  }
}

function normalizeStudent(student: IStudent): IStudent {
  return {
    ...student,
    Primer_apellido: student.Primer_apellido.toLocaleUpperCase(),
    Segundo_apellido: student.Segundo_apellido.toLocaleUpperCase(),
    Primer_nombre: student.Primer_nombre.toLocaleUpperCase(),
    Segundo_nombre: student.Segundo_nombre?.toLocaleUpperCase() || undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface';
import { AppResult } from '@/modules/shared/application/results/app-result';

export interface NewStudentGateway {
  register(student: IStudent): Promise<AppResult<unknown>>;
}

export interface NewStudentNotificationGateway {
  sendRegistration(student: IStudent): Promise<string>;
}

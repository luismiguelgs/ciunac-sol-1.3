import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface';
import { NewStudentNotificationGateway } from '@/modules/solicitud-nuevo/application/ports/register-new-student.ports';
import EmailService from '@/services/email.service';

export class NewStudentEmailGateway implements NewStudentNotificationGateway {
  sendRegistration(student: IStudent): Promise<string> {
    return EmailService.sendEmailRegister(student);
  }
}

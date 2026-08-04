import { RegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/use-cases/register-new-student.use-case';
import { NewStudentEmailGateway } from '@/modules/solicitud-nuevo/infrastructure/api/new-student-email.gateway';
import { Q10StudentGateway } from '@/modules/solicitud-nuevo/infrastructure/api/q10-student.gateway';

export function createRegisterNewStudentUseCase() {
  return new RegisterNewStudentUseCase({
    studentGateway: new Q10StudentGateway(),
    notificationGateway: new NewStudentEmailGateway(),
  });
}

import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface';
import { NewStudentGateway } from '@/modules/solicitud-nuevo/application/ports/register-new-student.ports';
import EstudiantesService from '@/services/estudiantes.service';

export class Q10StudentGateway implements NewStudentGateway {
  register(student: IStudent) {
    return EstudiantesService.nuevoEstudianteQ10(student);
  }
}

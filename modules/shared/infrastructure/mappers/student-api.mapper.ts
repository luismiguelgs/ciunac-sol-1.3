import IEstudiante from '@/modules/shared/interfaces/estudiante.interface';
import { StudentFormDto } from '@/modules/shared/infrastructure/dto/student-form.dto';

export function toStudentRequestDto(body: StudentFormDto): Partial<IEstudiante> {
  return {
    nombres: body.nombres.toUpperCase(),
    apellidos: body.apellidos.toUpperCase(),
    tipoDocumento: body.tipo_documento as IEstudiante['tipoDocumento'],
    numeroDocumento: body.dni,
    celular: body.celular,
    facultadId: body.facultad ? +body.facultad : undefined,
    escuelaId: body.escuela ? +body.escuela : undefined,
    codigo: body.codigo || undefined,
  };
}

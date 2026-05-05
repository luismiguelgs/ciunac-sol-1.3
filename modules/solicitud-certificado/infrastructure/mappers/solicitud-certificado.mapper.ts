import { EstudianteFormDto } from '@/modules/solicitud-certificado/infrastructure/dto/estudiante-form.dto';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';

export function toEstudianteFormDto(solicitud: Isolicitud): EstudianteFormDto {
  return {
    nombres: solicitud.nombres,
    apellidos: solicitud.apellidos,
    tipo_documento: solicitud.tipo_documento ?? 'DNI',
    dni: solicitud.dni,
    celular: solicitud.celular,
    facultad: solicitud.facultad,
    escuela: solicitud.escuela,
    codigo: solicitud.codigo,
  };
}

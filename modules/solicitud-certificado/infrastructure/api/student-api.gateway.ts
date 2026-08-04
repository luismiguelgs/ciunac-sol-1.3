import EstudiantesService from '@/services/estudiantes.service';
import IEstudiante from '@/modules/shared/interfaces/estudiante.interface';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { StudentGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports';
import { toEstudianteFormDto } from '@/modules/solicitud-certificado/infrastructure/mappers/solicitud-certificado.mapper';

export class StudentApiGateway implements StudentGateway {
  async saveFromSolicitud(solicitud: Isolicitud): Promise<IEstudiante> {
    try {
      const estudianteData = toEstudianteFormDto(solicitud);

      if (solicitud.estudianteId) {
        return await EstudiantesService.updateItem(solicitud.estudianteId, estudianteData);
      }

      return await EstudiantesService.newItem(estudianteData);
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo guardar la informacion del estudiante');
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }
}

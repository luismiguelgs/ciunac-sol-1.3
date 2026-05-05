import EstudiantesService, { IEstudianteFormDTO } from '@/services/estudiantes.service';
import IEstudiante from '@/modules/shared/interfaces/estudiante.interface';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { StudentUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';

export class StudentUbicacionApiGateway implements StudentUbicacionGateway {
  async saveFromSolicitud(solicitud: Isolicitud): Promise<IEstudiante> {
    try {
      if (solicitud.estudianteId) {
        return await EstudiantesService.updateItem(solicitud.estudianteId, solicitud as unknown as IEstudianteFormDTO);
      }

      return await EstudiantesService.newItem(solicitud as unknown as IEstudianteFormDTO);
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo guardar la informacion del estudiante');
      throw new AppError({
        code: 'INTEGRATION',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }
}

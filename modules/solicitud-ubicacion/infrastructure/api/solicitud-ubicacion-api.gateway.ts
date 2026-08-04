import SolicitudesService from '@/services/solicitudes.service';
import Isolicitud, { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface';
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';

export class SolicitudUbicacionApiGateway implements SolicitudUbicacionGateway {
  async create(solicitud: Isolicitud): Promise<string | null> {
    try {
      return await SolicitudesService.newItem(solicitud);
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo guardar la solicitud');
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }

  async searchByDni(dni: string): Promise<ISolicitudRes[]> {
    try {
      return await SolicitudesService.searchItemByDni(dni);
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo consultar solicitudes existentes');
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }
}

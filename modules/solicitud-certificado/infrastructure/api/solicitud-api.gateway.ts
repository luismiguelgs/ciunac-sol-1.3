import SolicitudesService from '@/services/solicitudes.service';
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudGateway } from '@/modules/solicitud-certificado/application/ports/register-solicitud-certificado.ports';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';

export class SolicitudApiGateway implements SolicitudGateway {
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
}

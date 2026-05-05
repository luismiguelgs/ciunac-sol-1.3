import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';
import { SolicitudBecaGateway } from '@/modules/solicitud-beca/application/ports/register-solicitud-beca.ports';
import SolicitudesService from '@/services/solicitudes.service';

export class SolicitudBecaApiGateway implements SolicitudBecaGateway {
  async create(solicitud: ISolicitudBeca): Promise<string | undefined> {
    try {
      return await SolicitudesService.newBeca(solicitud);
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo guardar la solicitud de beca');
      throw new AppError({
        code: 'INTEGRATION',
        message: appError.message,
        status: appError.status,
        cause: error,
      });
    }
  }
}

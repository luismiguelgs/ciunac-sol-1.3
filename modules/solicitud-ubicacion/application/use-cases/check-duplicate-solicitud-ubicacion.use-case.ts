import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { SolicitudUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports';

type Params = {
  dni: string;
  idioma: string;
  tipoSolicitud: string;
};

export class CheckDuplicateSolicitudUbicacionUseCase {
  constructor(private readonly solicitudGateway: SolicitudUbicacionGateway) {}

  async execute({ dni, idioma, tipoSolicitud }: Params) {
    try {
      const solicitudes = await this.solicitudGateway.searchByDni(dni);
      return solicitudes.some(
        (solicitud) =>
          solicitud.estadoId === 1 &&
          solicitud.idiomaId === Number(idioma) &&
          solicitud.tipoSolicitudId === Number(tipoSolicitud)
      );
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo verificar duplicidad de solicitud');
    }
  }
}

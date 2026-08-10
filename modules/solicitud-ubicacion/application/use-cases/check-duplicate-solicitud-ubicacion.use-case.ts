import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { LOCATION_REQUEST_TYPE_ID } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { SolicitudUbicacionGateway } from '@/modules/solicitud-ubicacion/application/ports/register-solicitud-ubicacion.ports'

type Params = {
  documentNumber: string
  languageId: number
};

export class CheckDuplicateSolicitudUbicacionUseCase {
  constructor(private readonly solicitudGateway: SolicitudUbicacionGateway) {}

  async execute({ documentNumber, languageId }: Params): Promise<boolean> {
    try {
      const solicitudes = await this.solicitudGateway.searchByDocument(documentNumber)
      return solicitudes.some(
        (solicitud) =>
          solicitud.estadoId === 1 &&
          solicitud.idiomaId === languageId &&
          solicitud.tipoSolicitudId === LOCATION_REQUEST_TYPE_ID,
      )
    } catch (error) {
      throw normalizeAppError(error, 'No se pudo verificar duplicidad de solicitud')
    }
  }
}

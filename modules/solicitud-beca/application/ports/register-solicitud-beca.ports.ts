import { SolicitudBeca } from '@/modules/solicitud-beca/domain/solicitud-beca'

export interface SolicitudBecaGateway {
  create(solicitud: SolicitudBeca): Promise<string>
}

export interface SolicitudBecaNotificationGateway {
  sendSolicitudCreada(requestId: string): Promise<string>
}

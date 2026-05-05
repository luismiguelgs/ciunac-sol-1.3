import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';

export interface SolicitudBecaGateway {
  create(solicitud: ISolicitudBeca): Promise<string | undefined>;
}

export interface SolicitudBecaNotificationGateway {
  sendSolicitudCreada(email: string, requestId: string): Promise<void>;
}

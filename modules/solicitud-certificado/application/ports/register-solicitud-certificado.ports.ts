import IEstudiante from '@/modules/shared/interfaces/estudiante.interface';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';

export interface StudentGateway {
  saveFromSolicitud(solicitud: Isolicitud): Promise<IEstudiante>;
}

export interface SolicitudGateway {
  create(solicitud: Isolicitud): Promise<string | null>;
}

export interface NotificationGateway {
  sendSolicitudCreada(email: string, requestId: string): Promise<string>;
}

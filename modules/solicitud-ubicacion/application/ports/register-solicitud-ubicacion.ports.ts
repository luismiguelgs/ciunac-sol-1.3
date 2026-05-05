import IEstudiante from '@/modules/shared/interfaces/estudiante.interface';
import Isolicitud, { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface';

export interface StudentUbicacionGateway {
  saveFromSolicitud(solicitud: Isolicitud): Promise<IEstudiante>;
}

export interface SolicitudUbicacionGateway {
  create(solicitud: Isolicitud): Promise<string | null>;
  searchByDni(dni: string): Promise<ISolicitudRes[]>;
}

export interface SolicitudUbicacionNotificationGateway {
  sendSolicitudCreada(email: string, requestId: string): Promise<void>;
}

import type {
  ExistingLocationRequest,
  SolicitudUbicacion,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export interface StudentUbicacionGateway {
  save(solicitud: SolicitudUbicacion): Promise<string>
}

export interface SolicitudUbicacionGateway {
  create(solicitud: SolicitudUbicacion, studentId: string): Promise<string>
  searchByDocument(documentNumber: string): Promise<ExistingLocationRequest[]>
}

export interface SolicitudUbicacionNotificationGateway {
  sendSolicitudCreada(requestId: string): Promise<string>
}

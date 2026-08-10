import { SolicitudUbicacion } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { LocationDuplicateResponseDto } from '@/modules/solicitud-ubicacion/infrastructure/dto/location-api.dto'

export interface StudentUbicacionGateway {
  save(solicitud: SolicitudUbicacion): Promise<string>
}

export interface SolicitudUbicacionGateway {
  create(solicitud: SolicitudUbicacion, studentId: string): Promise<string>
  searchByDocument(documentNumber: string): Promise<LocationDuplicateResponseDto[]>
}

export interface SolicitudUbicacionNotificationGateway {
  sendSolicitudCreada(requestId: string): Promise<string>
}

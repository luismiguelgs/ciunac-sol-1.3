import { SolicitudCertificado } from '@/modules/solicitud-certificado/domain/solicitud-certificado'

export interface StudentGateway {
  save(solicitud: SolicitudCertificado): Promise<string>
}

export interface SolicitudGateway {
  create(solicitud: SolicitudCertificado, studentId: string): Promise<string>
}

export interface NotificationGateway {
  sendSolicitudCreada(requestId: string): Promise<string>
}

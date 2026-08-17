import type { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export interface ConstanciaStudentGateway {
  save(solicitud: SolicitudConstancia): Promise<string>
}

export interface ConstanciaRequestGateway {
  create(solicitud: SolicitudConstancia, studentId: string): Promise<string>
}

export interface ConstanciaNotificationGateway {
  sendSolicitudCreada(requestId: string): Promise<string>
}

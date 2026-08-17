import type {
  CertificateLevelId,
  CertificateTypeId,
} from '@/modules/solicitud-certificado/domain/solicitud-certificado'

export type CertificateStudentRequestDto = {
  nombres: string
  apellidos: string
  tipoDocumento: 'DNI' | 'CE' | 'PASAPORTE'
  numeroDocumento: string
  celular: string
  email: string
  facultadId?: number
  escuelaId?: number
  codigo?: string
}

export type CertificateRequestDto = {
  estudianteId: string
  tipoSolicitudId: CertificateTypeId
  idiomaId: number
  nivelId: CertificateLevelId
  estadoId: number
  periodo: string
  alumnoCiunac: boolean
  fechaPago?: string
  pago: number
  digital: boolean
  numeroVoucher?: string
  imgVoucher?: string
}

import {
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

export type CertificateStudentResponseDto = { id: string }

export type CertificateStudentLookupResponseDto = CertificateStudentResponseDto & {
  nombres: string
  apellidos: string
  celular: string
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

export type CertificateCreateResponseDto = { id: string }

export type CertificateTypeResponseDto = {
  id: CertificateTypeId
  solicitud: string
  precio: number
}

export type CertificateLanguageResponseDto = { id: number; nombre: string }
export type CertificateFacultyResponseDto = { id: number; nombre: string; codigo: string }
export type CertificateSchoolResponseDto = { id: number; nombre: string; facultadId: number }
export type CertificateTextResponseDto = { codigo: string; contenido: string }

export type CertificateCargoResponseDto = {
  id: number
  creadoEn: string
  pago: number
  numeroVoucher: string | null
  fechaPago: string | null
  estudiante: {
    nombres: string
    apellidos: string
    numeroDocumento: string
  }
  tiposSolicitud: {
    id: CertificateTypeId
    solicitud: string
  }
  idioma: { nombre: string }
  nivel: { nombre: string }
}

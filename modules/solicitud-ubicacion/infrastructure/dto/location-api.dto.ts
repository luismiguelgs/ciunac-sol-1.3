import { LocationLevelId, LocationRequestTypeId } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export type LocationStudentRequestDto = {
  nombres: string
  apellidos: string
  tipoDocumento: 'DNI' | 'CE' | 'PASAPORTE'
  numeroDocumento: string
  celular: string
  email: string
  imgDoc: string
}

export type LocationStudentResponseDto = { id: string }

export type LocationStudentLookupResponseDto = LocationStudentResponseDto & {
  nombres: string
  apellidos: string
  celular: string
}

export type LocationRequestDto = {
  estudianteId: string
  tipoSolicitudId: LocationRequestTypeId
  idiomaId: number
  nivelId: LocationLevelId
  estadoId: number
  periodo: string
  alumnoCiunac: boolean
  fechaPago?: string
  pago: number
  digital: false
  numeroVoucher?: string
  imgCertEstudio?: string
  imgVoucher?: string
}

export type LocationCreateCommandDto = {
  documentNumber: string
  request: LocationRequestDto
}

export type LocationCreateResponseDto = { id: string }

export type LocationDuplicateResponseDto = {
  estadoId: number
  idiomaId: number
  tipoSolicitudId: number
}

export type LocationTypeResponseDto = {
  id: LocationRequestTypeId
  solicitud: string
  precio: number
}

export type LocationLanguageResponseDto = { id: number; nombre: string }
export type LocationTextResponseDto = { codigo: string; contenido: string }
export type LocationScheduleResponseDto = {
  id: number
  moduloId: number
  fecha: string
  activo: boolean
  modulo: { id: number; nombre: string }
}

export type LocationCargoResponseDto = {
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
    id: LocationRequestTypeId
    solicitud: string
  }
  idioma: { nombre: string }
  nivel: { nombre: string }
}


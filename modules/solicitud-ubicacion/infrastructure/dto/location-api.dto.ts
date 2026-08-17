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

export type ConstanciaStudentRequestDto = {
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

export type ConstanciaStudentResponseDto = {
  id: string
}

export type ConstanciaStudentLookupResponseDto = ConstanciaStudentResponseDto & {
  nombres: string
  apellidos: string
  celular: string
}

export type ConstanciaRequestDto = {
  estudianteId: string
  tipoSolicitudId: number
  idiomaId: number
  nivelId: number
  estadoId: number
  periodo: string
  alumnoCiunac: boolean
  fechaPago?: string
  pago: number
  digital: boolean
  numeroVoucher?: string
  imgVoucher?: string
}

export type ConstanciaCreateResponseDto = {
  id: string
}

export type ConstanciaTypeCatalogResponseDto = {
  id: number
  solicitud: string
  precio: number
}

export type ConstanciaCargoResponseDto = {
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
    id: 5 | 6
    solicitud: string
  }
  idioma: { nombre: string }
  nivel: { nombre: string }
}

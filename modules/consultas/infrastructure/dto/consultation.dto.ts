export type ConsultedRequestResponseDto = {
  id: number
  tipoSolicitudId: number
  estadoId: number
  creadoEn: string
  pago: number
  numeroVoucher: string | null
  fechaPago: string | null
  digital: boolean
  observaciones: string | null
  estudiante: {
    id: string
    nombres: string
    apellidos: string
    numeroDocumento: string
  }
  tiposSolicitud: {
    id: number
    solicitud: string
  }
  idioma: {
    id: number
    nombre: string
  }
  nivel: {
    id: number
    nombre: string
  }
  estado: {
    id: number
    nombre: string
    referencia: string
  }
}

export type ConsultationTextResponseDto = {
  codigo: string
  contenido: string
}

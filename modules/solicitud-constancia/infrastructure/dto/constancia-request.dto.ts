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

export type ConstanciaRequestDto = {
  estudianteId: string
  tipoSolicitudId: 5 | 6
  idiomaId: number
  nivelId: 1 | 2 | 3
  estadoId: number
  periodo: string
  alumnoCiunac: boolean
  fechaPago?: string
  pago: number
  digital: true
  numeroVoucher?: string
  imgVoucher?: string
}

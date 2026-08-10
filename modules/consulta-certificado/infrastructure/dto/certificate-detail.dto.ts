export type CertificateNoteResponseDto = {
  ciclo: string
  periodo: string
  modalidad: string
  nota: number
}

export type CertificateDetailResponseDto = {
  _id: string
  tipo: 'VIRTUAL' | 'FISICO'
  estudiante: string
  numeroDocumento: string
  idioma: string
  nivel: string
  cantidadHoras: number
  solicitudId: number
  fechaEmision: string
  numeroRegistro: string
  fechaConcluido: string
  aceptado: boolean
  fechaAceptacion: string | null
  notas: CertificateNoteResponseDto[]
}

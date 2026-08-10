export type ScholarshipRequestDto = {
  nombres: string
  apellidos: string
  telefono: string
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE'
  numero_documento: string
  facultad: string
  facultadId: string
  escuela: string
  escuelaId: string
  codigo: string
  direccion: string
  email: string
  periodo: string
  carta_de_compromiso: string
  historial_academico: string
  constancia_matricula: string
  contancia_tercio: string
  declaracion_jurada: string
}

export type ScholarshipCreateResponseDto = {
  _id?: string
  id?: string
}

export type ScholarshipFacultyResponseDto = {
  id: number
  nombre: string
  codigo: string
}

export type ScholarshipSchoolResponseDto = {
  id: number
  nombre: string
  facultadId: number
}

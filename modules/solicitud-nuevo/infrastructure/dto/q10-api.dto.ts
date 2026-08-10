export type Q10ProgramResponseDto = {
  Codigo: string
  Nombre: string
  Numero_resolucion: string | null
}

export type Q10StudentRequestDto = {
  Primer_apellido: string
  Segundo_apellido: string
  Primer_nombre: string
  Segundo_nombre?: string
  Email: string
  Codigo_tipo_identificacion: 'PE01' | 'PE02'
  Numero_identificacion: string
  Genero: 'F' | 'M'
  Fecha_nacimiento: string
  Telefono: string
  Celular: string
  Codigo_programa: string
}

export type Q10RegistrationResponseDto = Record<string, unknown>
